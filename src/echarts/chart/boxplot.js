define("crm-modules/common/echarts/chart/boxplot", [ "../echarts", "./boxplot/BoxplotSeries", "./boxplot/BoxplotView", "./boxplot/boxplotVisual", "./boxplot/boxplotLayout" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("./boxplot/BoxplotSeries");
    require("./boxplot/BoxplotView");
    echarts.registerVisualCoding("chart", require("./boxplot/boxplotVisual"));
    echarts.registerLayout(require("./boxplot/boxplotLayout"));
});