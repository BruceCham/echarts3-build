define("crm-modules/common/echarts/component/marker/MarkLineModel", [ "../../util/model", "../../echarts" ], function(require, exports, module) {
    var modelUtil = require("../../util/model");
    var MarkLineModel = require("../../echarts").extendComponentModel({
        type: "markLine",
        dependencies: [ "series", "grid", "polar" ],
        init: function(option, parentModel, ecModel, extraOpt) {
            this.mergeDefaultAndTheme(option, ecModel);
            this.mergeOption(option, ecModel, extraOpt.createdBySelf, true);
        },
        mergeOption: function(newOpt, ecModel, createdBySelf, isInit) {
            if (!createdBySelf) {
                ecModel.eachSeries(function(seriesModel) {
                    var markLineOpt = seriesModel.get("markLine");
                    var mlModel = seriesModel.markLineModel;
                    if (!markLineOpt || !markLineOpt.data) {
                        seriesModel.markLineModel = null;
                        return;
                    }
                    if (!mlModel) {
                        if (isInit) {
                            modelUtil.defaultEmphasis(markLineOpt.label, [ "position", "show", "textStyle", "distance", "formatter" ]);
                        }
                        var opt = {
                            seriesIndex: seriesModel.seriesIndex,
                            name: seriesModel.name,
                            createdBySelf: true
                        };
                        mlModel = new MarkLineModel(markLineOpt, this, ecModel, opt);
                    } else {
                        mlModel.mergeOption(markLineOpt, ecModel, true);
                    }
                    seriesModel.markLineModel = mlModel;
                }, this);
            }
        },
        defaultOption: {
            zlevel: 0,
            z: 5,
            symbol: [ "circle", "arrow" ],
            symbolSize: [ 8, 16 ],
            precision: 2,
            tooltip: {
                trigger: "item"
            },
            label: {
                normal: {
                    show: true,
                    position: "end"
                },
                emphasis: {
                    show: true
                }
            },
            lineStyle: {
                normal: {
                    type: "dashed"
                },
                emphasis: {
                    width: 3
                }
            },
            animationEasing: "linear"
        }
    });
    return MarkLineModel;
});