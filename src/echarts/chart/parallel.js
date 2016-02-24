define("crm-modules/common/echarts/chart/parallel", [ "../echarts", "../component/parallel", "./parallel/ParallelSeries", "./parallel/ParallelView", "./parallel/parallelVisual" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("../component/parallel");
    require("./parallel/ParallelSeries");
    require("./parallel/ParallelView");
    echarts.registerVisualCoding("chart", require("./parallel/parallelVisual"));
});