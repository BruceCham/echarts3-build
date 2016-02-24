define("crm-modules/common/echarts/ExtensionAPI", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echartsAPIList = [ "getDom", "getZr", "getWidth", "getHeight", "dispatchAction", "on", "off", "getDataURL", "getConnectedDataURL", "getModel", "getOption" ];
    function ExtensionAPI(chartInstance) {
        zrUtil.each(echartsAPIList, function(name) {
            this[name] = zrUtil.bind(chartInstance[name], chartInstance);
        }, this);
    }
    return ExtensionAPI;
});