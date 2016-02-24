define("crm-modules/common/echarts/coord/axisModelCommonMixin", [ "crm-modules/common/echarts/zrender/core/util", "./axisHelper" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var axisHelper = require("./axisHelper");
    function getName(obj) {
        if (zrUtil.isObject(obj) && obj.value != null) {
            return obj.value;
        } else {
            return obj;
        }
    }
    function getCategories() {
        return this.get("type") === "category" && zrUtil.map(this.get("data"), getName);
    }
    function getFormattedLabels() {
        return axisHelper.getFormattedLabels(this.axis, this.get("axisLabel.formatter"));
    }
    return {
        getFormattedLabels: getFormattedLabels,
        getCategories: getCategories
    };
});