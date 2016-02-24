define("crm-modules/common/echarts/model/mixin/areaStyle", [ "./makeStyleMapper" ], function(require, exports, module) {
    return {
        getAreaStyle: require("./makeStyleMapper")([ [ "fill", "color" ], [ "shadowBlur" ], [ "shadowOffsetX" ], [ "shadowOffsetY" ], [ "opacity" ], [ "shadowColor" ] ])
    };
});