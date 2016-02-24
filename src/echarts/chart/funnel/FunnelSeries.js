define("crm-modules/common/echarts/chart/funnel/FunnelSeries", [ "../../data/List", "../../util/model", "../../data/helper/completeDimensions", "../../echarts" ], function(require, exports, module) {
    "use strict";
    var List = require("../../data/List");
    var modelUtil = require("../../util/model");
    var completeDimensions = require("../../data/helper/completeDimensions");
    require("../../echarts").extendSeriesModel({
        type: "series.funnel",
        init: function(option) {
            this.$superApply("init", arguments);
            this.legendDataProvider = function() {
                return this._dataBeforeProcessed;
            };
            this._defaultLabelLine(option);
        },
        getInitialData: function(option, ecModel) {
            var dimensions = completeDimensions([ "value" ], option.data);
            var list = new List(dimensions, this);
            list.initData(option.data);
            return list;
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
            left: 80,
            top: 60,
            right: 80,
            bottom: 60,
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 0,
            funnelAlign: "center",
            label: {
                normal: {
                    show: true,
                    position: "outer"
                },
                emphasis: {
                    show: true
                }
            },
            labelLine: {
                normal: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        width: 1,
                        type: "solid"
                    }
                },
                emphasis: {}
            },
            itemStyle: {
                normal: {
                    borderColor: "#fff",
                    borderWidth: 1
                },
                emphasis: {}
            }
        }
    });
});