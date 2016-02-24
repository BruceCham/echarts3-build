define("crm-modules/common/echarts/coord/polar/polarCreator", [ "./Polar", "../../util/number", "crm-modules/common/echarts/zrender/core/util", "../../coord/axisHelper", "./PolarModel", "../../CoordinateSystem" ], function(require, exports, module) {
    var Polar = require("./Polar");
    var numberUtil = require("../../util/number");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var axisHelper = require("../../coord/axisHelper");
    var niceScaleExtent = axisHelper.niceScaleExtent;
    require("./PolarModel");
    function resizePolar(polarModel, api) {
        var center = polarModel.get("center");
        var radius = polarModel.get("radius");
        var width = api.getWidth();
        var height = api.getHeight();
        var parsePercent = numberUtil.parsePercent;
        this.cx = parsePercent(center[0], width);
        this.cy = parsePercent(center[1], height);
        var radiusAxis = this.getRadiusAxis();
        var size = Math.min(width, height) / 2;
        radiusAxis.setExtent(0, parsePercent(radius, size));
    }
    function setAxis(axis, axisModel) {
        axis.type = axisModel.get("type");
        axis.scale = axisHelper.createScaleByModel(axisModel);
        axis.onBand = axisModel.get("boundaryGap") && axis.type === "category";
        if (axisModel.mainType === "angleAxis") {
            var startAngle = axisModel.get("startAngle");
            axis.inverse = axisModel.get("inverse") ^ axisModel.get("clockwise");
            axis.setExtent(startAngle, startAngle + (axis.inverse ? -360 : 360));
        }
        axisModel.axis = axis;
        axis.model = axisModel;
    }
    function setPolarAxisFromSeries(polarList, ecModel, api) {
        ecModel.eachSeries(function(seriesModel) {
            if (seriesModel.get("coordinateSystem") === "polar") {
                var polarIndex = seriesModel.get("polarIndex") || 0;
                var polar = polarList[polarIndex];
                if (!polar) {
                    return;
                }
                seriesModel.coordinateSystem = polar;
                var radiusAxis = polar.getRadiusAxis();
                var angleAxis = polar.getAngleAxis();
                var data = seriesModel.getData();
                radiusAxis.scale.unionExtent(data.getDataExtent("radius", radiusAxis.type !== "category"));
                angleAxis.scale.unionExtent(data.getDataExtent("angle", angleAxis.type !== "category"));
            }
        });
        zrUtil.each(polarList, function(polar) {
            var angleAxis = polar.getAngleAxis();
            var radiusAxis = polar.getRadiusAxis();
            niceScaleExtent(angleAxis, angleAxis.model);
            niceScaleExtent(radiusAxis, radiusAxis.model);
        });
    }
    var polarCreator = {
        dimensions: Polar.prototype.dimensions,
        create: function(ecModel, api) {
            var polarList = [];
            ecModel.eachComponent("polar", function(polarModel, idx) {
                var polar = new Polar(idx);
                polar.resize = resizePolar;
                var radiusAxis = polar.getRadiusAxis();
                var angleAxis = polar.getAngleAxis();
                var radiusAxisModel = polarModel.findAxisModel("radiusAxis");
                var angleAxisModel = polarModel.findAxisModel("angleAxis");
                setAxis(radiusAxis, radiusAxisModel);
                setAxis(angleAxis, angleAxisModel);
                polar.resize(polarModel, api);
                polarList.push(polar);
                polarModel.coordinateSystem = polar;
            });
            setPolarAxisFromSeries(polarList, ecModel, api);
            zrUtil.each(polarList, function(polar) {
                var angleAxis = polar.getAngleAxis();
                if (angleAxis.type === "category" && !angleAxis.onBand) {
                    var extent = angleAxis.getExtent();
                    var diff = 360 / angleAxis.scale.count();
                    angleAxis.inverse ? extent[1] += diff : extent[1] -= diff;
                    angleAxis.setExtent(extent[0], extent[1]);
                }
            });
            return polarList;
        }
    };
    require("../../CoordinateSystem").register("polar", polarCreator);
});