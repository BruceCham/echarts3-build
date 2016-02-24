define("crm-modules/common/echarts/chart/heatmap/HeatmapSeries", [ "../../model/Series", "../helper/createListFromArray" ], function(require, exports, module) {
    var SeriesModel = require("../../model/Series");
    var createListFromArray = require("../helper/createListFromArray");
    return SeriesModel.extend({
        type: "series.heatmap",
        getInitialData: function(option, ecModel) {
            return createListFromArray(option.data, this, ecModel);
        },
        defaultOption: {
            coordinateSystem: "cartesian2d",
            zlevel: 0,
            z: 2,
            xAxisIndex: 0,
            yAxisIndex: 0,
            geoIndex: 0,
            blurSize: 30,
            pointSize: 20
        }
    });
});