define("crm-modules/common/echarts/chart/graph", [ "../echarts", "crm-modules/common/echarts/zrender/core/util", "./graph/GraphSeries", "./graph/GraphView", "./graph/roamAction", "./graph/categoryFilter", "../visual/symbol", "./graph/categoryVisual", "./graph/simpleLayout", "./graph/circularLayout", "./graph/forceLayout", "./graph/createView" ], function(require, exports, module) {
    var echarts = require("../echarts");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    require("./graph/GraphSeries");
    require("./graph/GraphView");
    require("./graph/roamAction");
    echarts.registerProcessor("filter", require("./graph/categoryFilter"));
    echarts.registerVisualCoding("chart", zrUtil.curry(require("../visual/symbol"), "graph", "circle", null));
    echarts.registerVisualCoding("chart", require("./graph/categoryVisual"));
    echarts.registerLayout(require("./graph/simpleLayout"));
    echarts.registerLayout(require("./graph/circularLayout"));
    echarts.registerLayout(require("./graph/forceLayout"));
    echarts.registerCoordinateSystem("graphView", {
        create: require("./graph/createView")
    });
});