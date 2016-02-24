define("crm-modules/common/echarts/coord/parallel/Parallel", [ "../../util/layout", "../../coord/axisHelper", "crm-modules/common/echarts/zrender/core/util", "./ParallelAxis", "crm-modules/common/echarts/zrender/core/matrix", "crm-modules/common/echarts/zrender/core/vector" ], function(require, exports, module) {
    var layout = require("../../util/layout");
    var axisHelper = require("../../coord/axisHelper");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var ParallelAxis = require("./ParallelAxis");
    var matrix = require("crm-modules/common/echarts/zrender/core/matrix");
    var vector = require("crm-modules/common/echarts/zrender/core/vector");
    var each = zrUtil.each;
    var PI = Math.PI;
    function Parallel(parallelModel, ecModel, api) {
        this._axesMap = {};
        this._axesLayout = {};
        this.dimensions = parallelModel.dimensions;
        this._rect;
        this._init(parallelModel, ecModel, api);
    }
    Parallel.prototype = {
        type: "parallel",
        constructor: Parallel,
        _init: function(parallelModel, ecModel, api) {
            var dimensions = parallelModel.dimensions;
            var parallelAxisIndex = parallelModel.parallelAxisIndex;
            each(dimensions, function(dim, idx) {
                var axisIndex = parallelAxisIndex[idx];
                var axisModel = ecModel.getComponent("parallelAxis", axisIndex);
                var axis = this._axesMap[dim] = new ParallelAxis(dim, axisHelper.createScaleByModel(axisModel), [ 0, 0 ], axisModel.get("type"), axisIndex);
                var isCategory = axis.type === "category";
                axis.onBand = isCategory && axisModel.get("boundaryGap");
                axis.inverse = axisModel.get("inverse");
                axisModel.axis = axis;
                axis.model = axisModel;
            }, this);
            this._updateAxesFromSeries(parallelModel, ecModel);
        },
        _updateAxesFromSeries: function(parallelModel, ecModel) {
            ecModel.eachSeries(function(seriesModel) {
                if (!parallelModel.contains(seriesModel, ecModel)) {
                    return;
                }
                var data = seriesModel.getData();
                each(this.dimensions, function(dim) {
                    this._axesMap[dim].scale.unionExtent(data.getDataExtent(dim));
                }, this);
            }, this);
        },
        resize: function(parallelModel, api) {
            this._rect = layout.getLayoutRect(parallelModel.getBoxLayoutParams(), {
                width: api.getWidth(),
                height: api.getHeight()
            });
            this._layoutAxes(parallelModel);
        },
        getRect: function() {
            return this._rect;
        },
        _layoutAxes: function(parallelModel) {
            var rect = this._rect;
            var layout = parallelModel.get("layout");
            var axes = this._axesMap;
            var dimensions = this.dimensions;
            var size = [ rect.width, rect.height ];
            var sizeIdx = layout === "horizontal" ? 0 : 1;
            var layoutLength = size[sizeIdx];
            var axisLength = size[1 - sizeIdx];
            var axisExtent = [ 0, axisLength ];
            each(axes, function(axis) {
                var idx = axis.inverse ? 1 : 0;
                axis.setExtent(axisExtent[idx], axisExtent[1 - idx]);
                axisHelper.niceScaleExtent(axis, axis.model);
            });
            each(dimensions, function(dim, idx) {
                var pos = layoutLength * idx / (dimensions.length - 1);
                var positionTable = {
                    horizontal: {
                        x: pos,
                        y: axisLength
                    },
                    vertical: {
                        x: 0,
                        y: pos
                    }
                };
                var rotationTable = {
                    horizontal: PI / 2,
                    vertical: 0
                };
                var position = [ positionTable[layout].x + rect.x, positionTable[layout].y + rect.y ];
                var rotation = rotationTable[layout];
                var transform = matrix.create();
                matrix.rotate(transform, transform, rotation);
                matrix.translate(transform, transform, position);
                this._axesLayout[dim] = {
                    position: position,
                    rotation: rotation,
                    transform: transform,
                    tickDirection: 1,
                    labelDirection: 1
                };
            }, this);
        },
        getAxis: function(dim) {
            return this._axesMap[dim];
        },
        dataToPoint: function(value, dim) {
            return this.axisCoordToPoint(this._axesMap[dim].dataToCoord(value), dim);
        },
        eachActiveState: function(data, callback, context) {
            var dimensions = this.dimensions;
            var axesMap = this._axesMap;
            var hasActiveSet = false;
            for (var j = 0, lenj = dimensions.length; j < lenj; j++) {
                if (axesMap[dimensions[j]].model.getActiveState() !== "normal") {
                    hasActiveSet = true;
                }
            }
            for (var i = 0, len = data.count(); i < len; i++) {
                var values = data.getValues(dimensions, i);
                var activeState;
                if (!hasActiveSet) {
                    activeState = "normal";
                } else {
                    activeState = "active";
                    for (var j = 0, lenj = dimensions.length; j < lenj; j++) {
                        var dimName = dimensions[j];
                        var state = axesMap[dimName].model.getActiveState(values[j], j);
                        if (state === "inactive") {
                            activeState = "inactive";
                            break;
                        }
                    }
                }
                callback.call(context, activeState, i);
            }
        },
        axisCoordToPoint: function(coord, dim) {
            var axisLayout = this._axesLayout[dim];
            var point = [ coord, 0 ];
            vector.applyTransform(point, point, axisLayout.transform);
            return point;
        },
        getAxisLayout: function(dim) {
            return zrUtil.clone(this._axesLayout[dim]);
        }
    };
    return Parallel;
});