define("crm-modules/common/echarts/model/mixin/itemStyle", [ "./makeStyleMapper" ], function(require, exports, module) {
    return {
        getItemStyle: require("./makeStyleMapper")([ [ "fill", "color" ], [ "stroke", "borderColor" ], [ "lineWidth", "borderWidth" ], [ "opacity" ], [ "shadowBlur" ], [ "shadowOffsetX" ], [ "shadowOffsetY" ], [ "shadowColor" ] ])
    };
});