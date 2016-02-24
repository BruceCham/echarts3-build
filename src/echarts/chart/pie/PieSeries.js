define("crm-modules/common/echarts/chart/pie/PieSeries", [ "../../data/List", "crm-modules/common/echarts/zrender/core/util", "../../util/model", "../../data/helper/completeDimensions", "../helper/dataSelectableMixin", "../../echarts" ], function(require, exports, module) {
    "use strict";
    var List = require("../../data/List");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var modelUtil = require("../../util/model");
    var completeDimensions = require("../../data/helper/completeDimensions");
    var dataSelectableMixin = require("../helper/dataSelectableMixin");
    var PieSeries = require("../../echarts").extendSeriesModel({
        type: "series.pie",
        init: function(option) {
            this.$superApply("init", arguments);
            this.legendDataProvider = function() {
                return this._dataBeforeProcessed;
            };
            this.updateSelectedMap();
            this._defaultLabelLine(option);
        },
        mergeOption: function(newOption) {
            this.$superCall("mergeOption", newOption);
            this.updateSelectedMap();
        },
        getInitialData: function(option, ecModel) {
            var dimensions = completeDimensions([ "value" ], option.data);
            var list = new List(dimensions, this);
            list.initData(option.data);
            return list;
        },
        getDataParams: function(dataIndex) {
            var data = this._data;
            var params = this.$superCall("getDataParams", dataIndex);
            params.percent = +(data.get("value", dataIndex) / data.getSum("value") * 100).toFixed(2);
            params.$vars.push("percent");
            return params;
        },
        _defaultLabelLine: function(option) {
            modelUtil.defaultEmphasis(option.labelLine, [ "show" ]);
            var labelLineNormalOpt = option.labelLine.normal;
            var labelLineEmphasisOpt = option.labelLine.emphasis;
            labelLineNormalOpt.show = labelLineNormalOpt.show && option.label.normal.show;
            labelLineEmphasisOpt.show = labelLineEmphasisOpt.show && option.label.emphasis.show;
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            legendHoverLink: true,
            hoverAnimation: true,
            center: [ "50%", "50%" ],
            radius: [ 0, "75%" ],
            clockwise: true,
            startAngle: 90,
            minAngle: 0,
            selectedOffset: 10,
            avoidLabelOverlap: true,
            label: {
                normal: {
                    rotate: false,
                    show: true,
                    position: "outer"
                },
                emphasis: {}
            },
            labelLine: {
                normal: {
                    show: true,
                    length: 20,
                    length2: 5,
                    smooth: false,
                    lineStyle: {
                        width: 1,
                        type: "solid"
                    }
                }
            },
            itemStyle: {
                normal: {
                    borderColor: "rgba(0,0,0,0)",
                    borderWidth: 1
                },
                emphasis: {
                    borderColor: "rgba(0,0,0,0)",
                    borderWidth: 1
                }
            },
            animationEasing: "cubicOut",
            data: []
        }
    });
    zrUtil.mixin(PieSeries, dataSelectableMixin);
    return PieSeries;
});