define("crm-modules/common/echarts/chart/sankey", [ "../echarts", "./sankey/SankeySeries", "./sankey/SankeyView", "./sankey/sankeyLayout", "./sankey/sankeyVisual" ], function(require, exports, module) {
    var echarts = require("../echarts");
    require("./sankey/SankeySeries");
    require("./sankey/SankeyView");
    echarts.registerLayout(require("./sankey/sankeyLayout"));
    echarts.registerVisualCoding("chart", require("./sankey/sankeyVisual"));
});