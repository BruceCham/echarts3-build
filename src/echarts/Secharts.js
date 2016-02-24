define("crm-modules/common/echarts/Secharts", [ "./echarts", "./chart/bar", "./chart/line", "./chart/pie", "./chart/funnel", "./component/grid", "./component/legend", "./component/tooltip", "./component/dataZoom", "./component/toolbox" ], function(require, exports, module) {
    var echarts = require("./echarts");
    require("./chart/bar");
    require("./chart/line");
    require("./chart/pie");
    require("./chart/funnel");
    require("./component/grid");
    require("./component/legend");
    require("./component/tooltip");
    require("./component/dataZoom");
    require("./component/toolbox");
    return echarts;
});