define("crm-modules/common/echarts/chart/candlestick/CandlestickSeries", [ "crm-modules/common/echarts/zrender/core/util", "../../model/Series", "../helper/whiskerBoxCommon", "../../util/format" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var SeriesModel = require("../../model/Series");
    var whiskerBoxCommon = require("../helper/whiskerBoxCommon");
    var formatUtil = require("../../util/format");
    var encodeHTML = formatUtil.encodeHTML;
    var addCommas = formatUtil.addCommas;
    var CandlestickSeries = SeriesModel.extend({
        type: "series.candlestick",
        dependencies: [ "xAxis", "yAxis", "grid" ],
        valueDimensions: [ "open", "close", "lowest", "highest" ],
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
            itemStyle: {
                normal: {
                    color: "#c23531",
                    color0: "#314656",
                    borderWidth: 1,
                    borderColor: "#c23531",
                    borderColor0: "#314656"
                },
                emphasis: {
                    borderWidth: 2
                }
            },
            animationUpdate: false,
            animationEasing: "linear",
            animationDuration: 300
        },
        getShadowDim: function() {
            return "open";
        },
        formatTooltip: function(dataIndex, mutipleSeries) {
            var valueHTMLArr = zrUtil.map(this.valueDimensions, function(dim) {
                return dim + ": " + addCommas(this._data.get(dim, dataIndex));
            }, this);
            return encodeHTML(this.name) + "<br />" + valueHTMLArr.join("<br />");
        }
    });
    zrUtil.mixin(CandlestickSeries, whiskerBoxCommon.seriesModelMixin, true);
    return CandlestickSeries;
});