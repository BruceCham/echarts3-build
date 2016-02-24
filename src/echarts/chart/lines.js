define("crm-modules/common/echarts/chart/lines", [ "./lines/LinesSeries", "./lines/LinesView", "crm-modules/common/echarts/zrender/core/util", "../echarts", "./lines/linesLayout", "../visual/seriesColor" ], function(require, exports, module) {
    require("./lines/LinesSeries");
    require("./lines/LinesView");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var echarts = require("../echarts");
    echarts.registerLayout(require("./lines/linesLayout"));
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/seriesColor"), "lines", "lineStyle"));
});