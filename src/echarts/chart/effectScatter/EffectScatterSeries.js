define("crm-modules/common/echarts/chart/effectScatter/EffectScatterSeries", [ "../helper/createListFromArray", "../../model/Series" ], function(require, exports, module) {
    "use strict";
    var createListFromArray = require("../helper/createListFromArray");
    var SeriesModel = require("../../model/Series");
    return SeriesModel.extend({
        type: "series.effectScatter",
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
            effectType: "ripple",
            showEffectOn: "render",
            rippleEffect: {
                period: 4,
                scale: 2.5,
                brushType: "fill"
            },
            xAxisIndex: 0,
            yAxisIndex: 0,
            polarIndex: 0,
            geoIndex: 0,
            symbolSize: 10
        }
    });
});