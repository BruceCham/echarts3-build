define("crm-modules/common/echarts/coord/single/singleCreator", [ "./Single", "../../CoordinateSystem" ], function(require, exports, module) {
    var Single = require("./Single");
    function create(ecModel, api) {
        var singles = [];
        ecModel.eachComponent("singleAxis", function(axisModel, idx) {
            var single = new Single(axisModel, ecModel, api);
            single.name = "single_" + idx;
            single.resize(axisModel, api);
            axisModel.coordinateSystem = single;
            singles.push(single);
        });
        ecModel.eachSeries(function(seriesModel) {
            if (seriesModel.get("coordinateSystem") === "single") {
                var singleAxisIndex = seriesModel.get("singleAxisIndex");
                var axisModel = ecModel.getComponent("singleAxis", singleAxisIndex);
                seriesModel.coordinateSystem = axisModel.coordinateSystem;
            }
        });
        return singles;
    }
    require("../../CoordinateSystem").register("single", {
        create: create
    });
});