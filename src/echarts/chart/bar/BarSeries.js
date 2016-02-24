define("crm-modules/common/echarts/chart/bar/BarSeries", [ "../../model/Series", "../helper/createListFromArray" ], function(require, exports, module) {
    "use strict";
    var SeriesModel = require("../../model/Series");
    var createListFromArray = require("../helper/createListFromArray");
    return SeriesModel.extend({
        type: "series.bar",
        dependencies: [ "grid", "polar" ],
        getInitialData: function(option, ecModel) {
            return createListFromArray(option.data, this, ecModel);
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "cartesian2d",
            legendHoverLink: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            barMinHeight: 0,
            barGap: "30%",
            barCategoryGap: "20%",
            itemStyle: {
                normal: {
                    barBorderColor: "#fff",
                    barBorderWidth: 0
                },
                emphasis: {
                    barBorderColor: "#fff",
                    barBorderWidth: 0
                }
            }
        }
    });
});