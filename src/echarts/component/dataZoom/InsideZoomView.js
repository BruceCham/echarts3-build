define("crm-modules/common/echarts/component/dataZoom/InsideZoomView", [ "./DataZoomView", "../../util/throttle", "crm-modules/common/echarts/zrender/core/util", "../helper/sliderMove", "../../component/helper/RoamController" ], function(require, exports, module) {
    var DataZoomView = require("./DataZoomView");
    var throttle = require("../../util/throttle");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var sliderMove = require("../helper/sliderMove");
    var RoamController = require("../../component/helper/RoamController");
    var bind = zrUtil.bind;
    return DataZoomView.extend({
        type: "dataZoom.inside",
        init: function(ecModel, api) {
            this._controllers = {};
            this._range;
        },
        render: function(dataZoomModel, ecModel, api, payload) {
            this.$superApply("render", arguments);
            throttle.createOrUpdate(this, "_dispatchZoomAction", this.dataZoomModel.get("throttle"), "fixRate");
            if (!payload || payload.type !== "dataZoom" || payload.from !== this.uid) {
                this._range = dataZoomModel.getPercentRange();
            }
            this._resetController(api);
        },
        remove: function() {
            this.$superApply("remove", arguments);
            var controllers = this._controllers;
            zrUtil.each(controllers, function(controller) {
                controller.off("pan").off("zoom");
            });
            controllers.length = 0;
            throttle.clear(this, "_dispatchZoomAction");
        },
        dispose: function() {
            this.$superApply("dispose", arguments);
            throttle.clear(this, "_dispatchZoomAction");
        },
        _resetController: function(api) {
            var controllers = this._controllers;
            var targetInfo = this.getTargetInfo();
            zrUtil.each(targetInfo.cartesians, function(item) {
                var key = "cartesian" + item.coordIndex;
                var controller = controllers[key];
                if (!controller) {
                    controller = controllers[key] = new RoamController(api.getZr());
                    controller.enable();
                    controller.on("pan", bind(this._onPan, this, controller, item));
                    controller.on("zoom", bind(this._onZoom, this, controller, item));
                }
                controller.rect = item.model.coordinateSystem.getRect().clone();
            }, this);
        },
        _onPan: function(controller, coordInfo, dx, dy) {
            var range = this._range = panCartesian([ dx, dy ], this._range, controller, coordInfo);
            if (range) {
                this._dispatchZoomAction(range);
            }
        },
        _onZoom: function(controller, coordInfo, scale, mouseX, mouseY) {
            var dataZoomModel = this.dataZoomModel;
            if (dataZoomModel.option.zoomLock) {
                return;
            }
            scale = 1 / scale;
            var range = this._range = scaleCartesian(scale, [ mouseX, mouseY ], this._range, controller, coordInfo, dataZoomModel);
            this._dispatchZoomAction(range);
        },
        _dispatchZoomAction: function(range) {
            this.api.dispatchAction({
                type: "dataZoom",
                from: this.uid,
                dataZoomId: this.dataZoomModel.id,
                start: range[0],
                end: range[1]
            });
        }
    });
    function panCartesian(pixelDeltas, range, controller, coordInfo) {
        range = range.slice();
        var axisModel = coordInfo.axisModels[0];
        if (!axisModel) {
            return;
        }
        var directionInfo = getDirectionInfo(pixelDeltas, axisModel, controller);
        var percentDelta = directionInfo.signal * (range[1] - range[0]) * directionInfo.pixel / directionInfo.pixelLength;
        sliderMove(percentDelta, range, [ 0, 100 ], "rigid");
        return range;
    }
    function scaleCartesian(scale, mousePoint, range, controller, coordInfo, dataZoomModel) {
        range = range.slice();
        var axisModel = coordInfo.axisModels[0];
        if (!axisModel) {
            return;
        }
        var directionInfo = getDirectionInfo(mousePoint, axisModel, controller);
        var mouse = directionInfo.pixel - directionInfo.pixelStart;
        var percentPoint = mouse / directionInfo.pixelLength * (range[1] - range[0]) + range[0];
        scale = Math.max(scale, 0);
        range[0] = (range[0] - percentPoint) * scale + percentPoint;
        range[1] = (range[1] - percentPoint) * scale + percentPoint;
        return fixRange(range);
    }
    function getDirectionInfo(xy, axisModel, controller) {
        var axis = axisModel.axis;
        var rect = controller.rect;
        var ret = {};
        if (axis.dim === "x") {
            ret.pixel = xy[0];
            ret.pixelLength = rect.width;
            ret.pixelStart = rect.x;
            ret.signal = axis.inverse ? 1 : -1;
        } else {
            ret.pixel = xy[1];
            ret.pixelLength = rect.height;
            ret.pixelStart = rect.y;
            ret.signal = axis.inverse ? -1 : 1;
        }
        return ret;
    }
    function fixRange(range) {
        var bound = [ 0, 100 ];
        !(range[0] <= bound[1]) && (range[0] = bound[1]);
        !(range[1] <= bound[1]) && (range[1] = bound[1]);
        !(range[0] >= bound[0]) && (range[0] = bound[0]);
        !(range[1] >= bound[0]) && (range[1] = bound[0]);
        return range;
    }
});