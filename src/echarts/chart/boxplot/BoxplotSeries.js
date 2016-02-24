define("crm-modules/common/echarts/chart/boxplot/BoxplotSeries", [ "crm-modules/common/echarts/zrender/core/util", "../../model/Series", "../helper/whiskerBoxCommon" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var SeriesModel = require("../../model/Series");
    var whiskerBoxCommon = require("../helper/whiskerBoxCommon");
    var BoxplotSeries = SeriesModel.extend({
        type: "series.boxplot",
        dependencies: [ "xAxis", "yAxis", "grid" ],
        valueDimensions: [ "min", "Q1", "median", "Q3", "max" ],
        dimensions: null,
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "cartesian2d",
            legendHoverLink: true,
            hoverAnimation: true,
            xAxisIndex: 0,
            yAxisIndex: 0,
            layout: null,
            boxWidth: [ 7, 50 ],
            itemStyle: {
                normal: {
                    color: "#fff",
                    borderWidth: 1
                },
                emphasis: {
                    borderWidth: 2,
                    shadowBlur: 5,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    shadowColor: "rgba(0,0,0,0.4)"
                }
            },
            animationEasing: "elasticOut",
            animationDuration: 800
        }
    });
    zrUtil.mixin(BoxplotSeries, whiskerBoxCommon.seriesModelMixin, true);
    return BoxplotSeries;
});