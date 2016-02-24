define("crm-modules/common/echarts/chart/treemap", [ "../echarts", "./treemap/TreemapSeries", "./treemap/TreemapView", "./treemap/treemapAction", "./treemap/treemapVisual", "./treemap/treemapLayout" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("./treemap/TreemapSeries");
    require("./treemap/TreemapView");
    require("./treemap/treemapAction");
    echarts.registerVisualCoding("chart", require("./treemap/treemapVisual"));
    echarts.registerLayout(require("./treemap/treemapLayout"));
});