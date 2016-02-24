define("crm-modules/common/echarts/model/mixin/makeStyleMapper", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    return function(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (!properties[i][1]) {
                properties[i][1] = properties[i][0];
            }
        }
        return function(excludes) {
            var style = {};
            for (var i = 0; i < properties.length; i++) {
                var propName = properties[i][1];
                if (excludes && zrUtil.indexOf(excludes, propName) >= 0) {
                    continue;
                }
                var val = this.getShallow(propName);
                if (val != null) {
                    style[properties[i][0]] = val;
                }
            }
            return style;
        };
    };
});