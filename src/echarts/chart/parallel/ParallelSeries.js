define("crm-modules/common/echarts/chart/parallel/ParallelSeries", [ "../../data/List", "crm-modules/common/echarts/zrender/core/util", "../../model/Series" ], function(require, exports, module) {
    var List = require("../../data/List");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var SeriesModel = require("../../model/Series");
    return SeriesModel.extend({
        type: "series.parallel",
        dependencies: [ "parallel" ],
        getInitialData: function(option, ecModel) {
            var parallelModel = ecModel.getComponent("parallel", this.get("parallelIndex"));
            var dimensions = parallelModel.dimensions;
            var parallelAxisIndices = parallelModel.parallelAxisIndex;
            var rawData = option.data;
            var dimensionsInfo = zrUtil.map(dimensions, function(dim, index) {
                var axisModel = ecModel.getComponent("parallelAxis", parallelAxisIndices[index]);
                if (axisModel.get("type") === "category") {
                    translateCategoryValue(axisModel, dim, rawData);
                    return {
                        name: dim,
                        type: "ordinal"
                    };
                } else {
                    return dim;
                }
            });
            var list = new List(dimensionsInfo, this);
            list.initData(rawData);
            return list;
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "parallel",
            parallelIndex: 0,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            inactiveOpacity: .05,
            activeOpacity: 1,
            lineStyle: {
                normal: {
                    width: 2,
                    opacity: .45,
                    type: "solid"
                }
            },
            animationEasing: "linear"
        }
    });
    function translateCategoryValue(axisModel, dim, rawData) {
        var axisData = axisModel.get("data");
        var numberDim = +dim.replace("dim", "");
        if (axisData && axisData.length) {
            zrUtil.each(rawData, function(dataItem) {
                if (!dataItem) {
                    return;
                }
                var index = zrUtil.indexOf(axisData, dataItem[numberDim]);
                dataItem[numberDim] = index >= 0 ? index : NaN;
            });
        }
    }
});