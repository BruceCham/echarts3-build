define("crm-modules/common/echarts/coord/parallel/parallelCreator", [ "./Parallel", "../../CoordinateSystem" ], function(require, exports, module) {
    var Parallel = require("./Parallel");
    function create(ecModel, api) {
        var coordSysList = [];
        ecModel.eachComponent("parallel", function(parallelModel, idx) {
            var coordSys = new Parallel(parallelModel, ecModel, api);
            coordSys.name = "parallel_" + idx;
            coordSys.resize(parallelModel, api);
            parallelModel.coordinateSystem = coordSys;
            coordSys.model = parallelModel;
            coordSysList.push(coordSys);
        });
        ecModel.eachSeries(function(seriesModel) {
            if (seriesModel.get("coordinateSystem") === "parallel") {
                var parallelIndex = seriesModel.get("parallelIndex");
                seriesModel.coordinateSystem = coordSysList[parallelIndex];
            }
        });
        return coordSysList;
    }
    require("../../CoordinateSystem").register("parallel", {
        create: create
    });
});