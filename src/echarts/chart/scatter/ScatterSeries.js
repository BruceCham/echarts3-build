define("crm-modules/common/echarts/chart/scatter/ScatterSeries", [ "../helper/createListFromArray", "../../model/Series" ], function(require, exports, module) {
    "use strict";
    var createListFromArray = require("../helper/createListFromArray");
    var SeriesModel = require("../../model/Series");
    return SeriesModel.extend({
        type: "series.scatter",
        dependencies: [ "grid", "polar" ],
        getInitialData: function(option, ecModel) {
            var list = createListFromArray(option.data, this, ecModel);
            return list;
        },
        defaultOption: {
            coordinateSystem: "cartesian2d",
            zlevel: 0,
            z: 2,
            legendHoverLink: true,
            hoverAnimation: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            polarIndex: 0,
            geoIndex: 0,
            symbolSize: 10,
            large: false,
            largeThreshold: 2e3,
            itemStyle: {
                normal: {
                    opacity: .8
                }
            }
        }
    });
});