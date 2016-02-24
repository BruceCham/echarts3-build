define("crm-modules/common/echarts/component/dataZoom/DataZoomView", [ "../../view/Component" ], function(require, exports, module) {
    var ComponentView = require("../../view/Component");
    return ComponentView.extend({
        type: "dataZoom",
        render: function(dataZoomModel, ecModel, api, payload) {
            this.dataZoomModel = dataZoomModel;
            this.ecModel = ecModel;
            this.api = api;
        },
        getTargetInfo: function() {
            var dataZoomModel = this.dataZoomModel;
            var ecModel = this.ecModel;
            var cartesians = [];
            var polars = [];
            var axisModels = [];
            dataZoomModel.eachTargetAxis(function(dimNames, axisIndex) {
                var axisModel = ecModel.getComponent(dimNames.axis, axisIndex);
                if (axisModel) {
                    axisModels.push(axisModel);
                    var gridIndex = axisModel.get("gridIndex");
                    var polarIndex = axisModel.get("polarIndex");
                    if (gridIndex != null) {
                        var coordModel = ecModel.getComponent("grid", gridIndex);
                        save(coordModel, axisModel, cartesians, gridIndex);
                    } else if (polarIndex != null) {
                        var coordModel = ecModel.getComponent("polar", polarIndex);
                        save(coordModel, axisModel, polars, polarIndex);
                    }
                }
            }, this);
            function save(coordModel, axisModel, store, coordIndex) {
                var item;
                for (var i = 0; i < store.length; i++) {
                    if (store[i].model === coordModel) {
                        item = store[i];
                        break;
                    }
                }
                if (!item) {
                    store.push(item = {
                        model: coordModel,
                        axisModels: [],
                        coordIndex: coordIndex
                    });
                }
                item.axisModels.push(axisModel);
            }
            return {
                cartesians: cartesians,
                polars: polars,
                axisModels: axisModels
            };
        }
    });
});