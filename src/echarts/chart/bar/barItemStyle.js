define("crm-modules/common/echarts/chart/bar/barItemStyle", [ "../../model/mixin/makeStyleMapper" ], function(require, exports, module) {
    return {
        getBarItemStyle: require("../../model/mixin/makeStyleMapper")([ [ "fill", "color" ], [ "stroke", "barBorderColor" ], [ "lineWidth", "barBorderWidth" ], [ "opacity" ], [ "shadowBlur" ], [ "shadowOffsetX" ], [ "shadowOffsetY" ], [ "shadowColor" ] ])
    };
});