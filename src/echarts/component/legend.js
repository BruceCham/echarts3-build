define("crm-modules/common/echarts/component/legend", [ "./legend/LegendModel", "./legend/legendAction", "./legend/LegendView", "../echarts", "./legend/legendFilter" ], function(require, exports, module) {
    require("./legend/LegendModel");
    require("./legend/legendAction");
    require("./legend/LegendView");
    var echarts = require("../echarts");
    echarts.registerProcessor("filter", require("./legend/legendFilter"));
});