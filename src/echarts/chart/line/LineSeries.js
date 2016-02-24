define("crm-modules/common/echarts/chart/line/LineSeries", [ "../helper/createListFromArray", "../../model/Series" ], function(require, exports, module) {
    "use strict";
    var createListFromArray = require("../helper/createListFromArray");
    var SeriesModel = require("../../model/Series");
    return SeriesModel.extend({
        type: "series.line",
        dependencies: [ "grid", "polar" ],
        getInitialData: function(option, ecModel) {
            return createListFromArray(option.data, this, ecModel);
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "cartesian2d",
            legendHoverLink: true,
            hoverAnimation: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            polarIndex: 0,
            clipOverflow: true,
            label: {
                normal: {
                    position: "top"
                },
                emphasis: {
                    position: "top"
                }
            },
            lineStyle: {
                normal: {
                    width: 2,
                    type: "solid"
                }
            },
            symbol: "emptyCircle",
            symbolSize: 4,
            showSymbol: true,
            animationEasing: "linear"
        }
    });
});