define("crm-modules/common/echarts/chart/candlestick/preprocessor", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    return function(option) {
        if (!option || !zrUtil.isArray(option.series)) {
            return;
        }
        zrUtil.each(option.series, function(seriesItem) {
            if (zrUtil.isObject(seriesItem) && seriesItem.type === "k") {
                seriesItem.type = "candlestick";
            }
        });
    };
});