define("crm-modules/common/echarts/component/marker/MarkPointModel", [ "../../util/model", "../../echarts" ], function(require, exports, module) {
    var modelUtil = require("../../util/model");
    var MarkPointModel = require("../../echarts").extendComponentModel({
        type: "markPoint",
        dependencies: [ "series", "grid", "polar" ],
        init: function(option, parentModel, ecModel, extraOpt) {
            this.mergeDefaultAndTheme(option, ecModel);
            this.mergeOption(option, ecModel, extraOpt.createdBySelf, true);
        },
        mergeOption: function(newOpt, ecModel, createdBySelf, isInit) {
            if (!createdBySelf) {
                ecModel.eachSeries(function(seriesModel) {
                    var markPointOpt = seriesModel.get("markPoint");
                    var mpModel = seriesModel.markPointModel;
                    if (!markPointOpt || !markPointOpt.data) {
                        seriesModel.markPointModel = null;
                        return;
                    }
                    if (!mpModel) {
                        if (isInit) {
                            modelUtil.defaultEmphasis(markPointOpt.label, [ "position", "show", "textStyle", "distance", "formatter" ]);
                        }
                        var opt = {
                            seriesIndex: seriesModel.seriesIndex,
                            name: seriesModel.name,
                            createdBySelf: true
                        };
                        mpModel = new MarkPointModel(markPointOpt, this, ecModel, opt);
                    } else {
                        mpModel.mergeOption(markPointOpt, ecModel, true);
                    }
                    seriesModel.markPointModel = mpModel;
                }, this);
            }
        },
        defaultOption: {
            zlevel: 0,
            z: 5,
            symbol: "pin",
            symbolSize: 50,
            tooltip: {
                trigger: "item"
            },
            label: {
                normal: {
                    show: true,
                    position: "inside"
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    borderWidth: 2
                },
                emphasis: {}
            }
        }
    });
    return MarkPointModel;
});