define("crm-modules/common/echarts/chart/map/backwardCompat", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var geoProps = [ "x", "y", "x2", "y2", "width", "height", "map", "roam", "roamDetail", "label", "itemStyle" ];
    var geoCoordsMap = {};
    function createGeoFromMap(mapSeriesOpt) {
        var geoOpt = {};
        zrUtil.each(geoProps, function(propName) {
            if (mapSeriesOpt[propName] != null) {
                geoOpt[propName] = mapSeriesOpt[propName];
            }
        });
        return geoOpt;
    }
    return function(option) {
        var mapSeries = [];
        zrUtil.each(option.series, function(seriesOpt) {
            if (seriesOpt.type === "map") {
                mapSeries.push(seriesOpt);
            }
            zrUtil.extend(geoCoordsMap, seriesOpt.geoCoord);
        });
        var newCreatedGeoOptMap = {};
        zrUtil.each(mapSeries, function(seriesOpt) {
            seriesOpt.map = seriesOpt.map || seriesOpt.mapType;
            zrUtil.defaults(seriesOpt, seriesOpt.mapLocation);
            if (seriesOpt.markPoint) {
                var markPoint = seriesOpt.markPoint;
                markPoint.data = zrUtil.map(markPoint.data, function(dataOpt) {
                    if (!zrUtil.isArray(dataOpt.value)) {
                        var geoCoord;
                        if (dataOpt.geoCoord) {
                            geoCoord = dataOpt.geoCoord;
                        } else if (dataOpt.name) {
                            geoCoord = geoCoordsMap[dataOpt.name];
                        }
                        var newValue = geoCoord ? [ geoCoord[0], geoCoord[1] ] : [ NaN, NaN ];
                        if (dataOpt.value != null) {
                            newValue.push(dataOpt.value);
                        }
                        dataOpt.value = newValue;
                    }
                    return dataOpt;
                });
                if (!(seriesOpt.data && seriesOpt.data.length)) {
                    if (!option.geo) {
                        option.geo = [];
                    }
                    var geoOpt = newCreatedGeoOptMap[seriesOpt.map];
                    if (!geoOpt) {
                        geoOpt = newCreatedGeoOptMap[seriesOpt.map] = createGeoFromMap(seriesOpt);
                        option.geo.push(geoOpt);
                    }
                    var scatterSeries = seriesOpt.markPoint;
                    scatterSeries.type = option.effect && option.effect.show ? "effectScatter" : "scatter";
                    scatterSeries.coordinateSystem = "geo";
                    scatterSeries.geoIndex = zrUtil.indexOf(option.geo, geoOpt);
                    scatterSeries.name = seriesOpt.name;
                    option.series.splice(zrUtil.indexOf(option.series, seriesOpt), 1, scatterSeries);
                }
            }
        });
    };
});