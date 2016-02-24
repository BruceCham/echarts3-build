define("crm-modules/common/echarts/chart/bar", [ "crm-modules/common/echarts/zrender/core/util", "../coord/cartesian/Grid", "./bar/BarSeries", "./bar/BarView", "../layout/barGrid", "../echarts" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    require("../coord/cartesian/Grid");
    require("./bar/BarSeries");
    require("./bar/BarView");
    var barLayoutGrid = require("../layout/barGrid");
    var echarts = require("../echarts");
    echarts.registerLayout(zrUtil.curry(barLayoutGrid, "bar"));
    echarts.registerVisualCoding("chart", function(ecModel) {
        ecModel.eachSeriesByType("bar", function(seriesModel) {
            var data = seriesModel.getData();
            data.setVisual("legendSymbol", "roundRect");
        });
    });
});