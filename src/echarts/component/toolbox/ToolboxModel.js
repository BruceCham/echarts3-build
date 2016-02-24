define("crm-modules/common/echarts/component/toolbox/ToolboxModel", [ "./featureManager", "crm-modules/common/echarts/zrender/core/util", "../../echarts" ], function(require, exports, module) {
    var featureManager = require("./featureManager");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    require("../../echarts").extendComponentModel({
        type: "toolbox",
        mergeDefaultAndTheme: function(option) {
            this.$superApply("mergeDefaultAndTheme", arguments);
            zrUtil.each(this.option.feature, function(featureOpt, featureName) {
                var Feature = featureManager.get(featureName);
                Feature && zrUtil.merge(featureOpt, Feature.defaultOption);
            });
        },
        defaultOption: {
            show: true,
            z: 6,
            zlevel: 0,
            orient: "horizontal",
            left: "right",
            top: "top",
            backgroundColor: "transparent",
            borderColor: "#ccc",
            borderWidth: 0,
            padding: 5,
            itemSize: 15,
            itemGap: 8,
            showTitle: true,
            iconStyle: {
                normal: {
                    borderColor: "#666",
                    color: "none"
                },
                emphasis: {
                    borderColor: "#3E98C5"
                }
            }
        }
    });
});