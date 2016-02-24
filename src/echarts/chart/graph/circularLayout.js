define("crm-modules/common/echarts/chart/graph/circularLayout", [ "./circularLayoutHelper" ], function(require, exports, module) {
    var circularLayoutHelper = require("./circularLayoutHelper");
    return function(ecModel, api) {
        ecModel.eachSeriesByType("graph", function(seriesModel) {
            if (seriesModel.get("layout") === "circular") {
                circularLayoutHelper(seriesModel);
            }
        });
    };
});