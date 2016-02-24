define("crm-modules/common/echarts/component/visualMap/VisualMapView", [ "../../echarts", "crm-modules/common/echarts/zrender/core/util", "../../util/graphic", "../../util/format", "../../util/layout", "../../visual/VisualMapping" ], function(require, exports, module) {
    var echarts = require("../../echarts");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var graphic = require("../../util/graphic");
    var formatUtil = require("../../util/format");
    var layout = require("../../util/layout");
    var VisualMapping = require("../../visual/VisualMapping");
    return echarts.extendComponentView({
        type: "visualMap",
        autoPositionValues: {
            left: 1,
            right: 1,
            top: 1,
            bottom: 1
        },
        init: function(ecModel, api) {
            this.ecModel = ecModel;
            this.api = api;
            this.visualMapModel;
            this._updatableShapes = {};
        },
        render: function(visualMapModel, ecModel, api, payload) {
            this.visualMapModel = visualMapModel;
            if (visualMapModel.get("show") === false) {
                this.group.removeAll();
                return;
            }
            this.doRender.apply(this, arguments);
        },
        renderBackground: function(group) {
            var visualMapModel = this.visualMapModel;
            var padding = formatUtil.normalizeCssArray(visualMapModel.get("padding") || 0);
            var rect = group.getBoundingRect();
            group.add(new graphic.Rect({
                z2: -1,
                silent: true,
                shape: {
                    x: rect.x - padding[3],
                    y: rect.y - padding[0],
                    width: rect.width + padding[3] + padding[1],
                    height: rect.height + padding[0] + padding[2]
                },
                style: {
                    fill: visualMapModel.get("backgroundColor"),
                    stroke: visualMapModel.get("borderColor"),
                    lineWidth: visualMapModel.get("borderWidth")
                }
            }));
        },
        getControllerVisual: function(targetValue, forceState, visualCluster) {
            var visualMapModel = this.visualMapModel;
            var targetIsArray = zrUtil.isArray(targetValue);
            if (targetIsArray && (!forceState || visualCluster !== "color")) {
                throw new Error(targetValue);
            }
            var mappings = visualMapModel.controllerVisuals[forceState || visualMapModel.getValueState(targetValue)];
            var defaultColor = visualMapModel.get("contentColor");
            var visualObj = {
                symbol: visualMapModel.get("itemSymbol"),
                color: targetIsArray ? [ {
                    color: defaultColor,
                    offset: 0
                }, {
                    color: defaultColor,
                    offset: 1
                } ] : defaultColor
            };
            function getter(key) {
                return visualObj[key];
            }
            function setter(key, value) {
                visualObj[key] = value;
            }
            var visualTypes = VisualMapping.prepareVisualTypes(mappings);
            zrUtil.each(visualTypes, function(type) {
                var visualMapping = mappings[type];
                if (!visualCluster || VisualMapping.isInVisualCluster(type, visualCluster)) {
                    visualMapping && visualMapping.applyVisual(targetValue, getter, setter);
                }
            });
            return visualObj;
        },
        positionGroup: function(group) {
            var model = this.visualMapModel;
            var api = this.api;
            layout.positionGroup(group, model.getBoxLayoutParams(), {
                width: api.getWidth(),
                height: api.getHeight()
            });
        },
        doRender: zrUtil.noop
    });
});