define("crm-modules/common/echarts/visual/visualDefault", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var visualDefault = {
        get: function(visualType, key, isCategory) {
            var value = zrUtil.clone((defaultOption[visualType] || {})[key]);
            return isCategory ? zrUtil.isArray(value) ? value[value.length - 1] : value : value;
        }
    };
    var defaultOption = {
        color: {
            active: [ "#006edd", "#e0ffff" ],
            inactive: [ "rgba(0,0,0,0)" ]
        },
        colorHue: {
            active: [ 0, 360 ],
            inactive: [ 0, 0 ]
        },
        colorSaturation: {
            active: [ .3, 1 ],
            inactive: [ 0, 0 ]
        },
        colorLightness: {
            active: [ .9, .5 ],
            inactive: [ 0, 0 ]
        },
        colorAlpha: {
            active: [ .3, 1 ],
            inactive: [ 0, 0 ]
        },
        symbol: {
            active: [ "circle", "roundRect", "diamond" ],
            inactive: [ "none" ]
        },
        symbolSize: {
            active: [ 10, 50 ],
            inactive: [ 0, 0 ]
        }
    };
    return visualDefault;
});