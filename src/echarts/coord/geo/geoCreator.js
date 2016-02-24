define("crm-modules/common/echarts/coord/geo/geoCreator", [ "./GeoModel", "./Geo", "../../util/layout", "crm-modules/common/echarts/zrender/core/util", "../../echarts" ], function(require, exports, module) {
    require("./GeoModel");
    var Geo = require("./Geo");
    var layout = require("../../util/layout");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var mapDataStores = {};
    function resizeGeo(geoModel, api) {
        var rect = this.getBoundingRect();
        var boxLayoutOption = geoModel.getBoxLayoutParams();
        boxLayoutOption.aspect = rect.width / rect.height * .75;
        var viewRect = layout.getLayoutRect(boxLayoutOption, {
            width: api.getWidth(),
            height: api.getHeight()
        });
        this.setViewRect(viewRect.x, viewRect.y, viewRect.width, viewRect.height);
        var roamDetailModel = geoModel.getModel("roamDetail");
        var panX = roamDetailModel.get("x") || 0;
        var panY = roamDetailModel.get("y") || 0;
        var zoom = roamDetailModel.get("zoom") || 1;
        this.setPan(panX, panY);
        this.setZoom(zoom);
    }
    function setGeoCoords(geo, model) {
        zrUtil.each(model.get("geoCoord"), function(geoCoord, name) {
            geo.addGeoCoord(name, geoCoord);
        });
    }
    function mapNotExistsError(name) {
        console.error("Map " + name + " not exists");
    }
    var geoCreator = {
        dimensions: Geo.prototype.dimensions,
        create: function(ecModel, api) {
            var geoList = [];
            ecModel.eachComponent("geo", function(geoModel, idx) {
                var name = geoModel.get("map");
                var mapData = mapDataStores[name];
                if (!mapData) {
                    mapNotExistsError(name);
                }
                var geo = new Geo(name + idx, name, mapData && mapData.geoJson, mapData && mapData.specialAreas, geoModel.get("nameMap"));
                geoList.push(geo);
                setGeoCoords(geo, geoModel);
                geoModel.coordinateSystem = geo;
                geo.model = geoModel;
                geo.resize = resizeGeo;
                geo.resize(geoModel, api);
            });
            ecModel.eachSeries(function(seriesModel) {
                var coordSys = seriesModel.get("coordinateSystem");
                if (coordSys === "geo") {
                    var geoIndex = seriesModel.get("geoIndex") || 0;
                    seriesModel.coordinateSystem = geoList[geoIndex];
                }
            });
            var mapModelGroupBySeries = {};
            ecModel.eachSeriesByType("map", function(seriesModel) {
                var mapType = seriesModel.get("map");
                mapModelGroupBySeries[mapType] = mapModelGroupBySeries[mapType] || [];
                mapModelGroupBySeries[mapType].push(seriesModel);
            });
            zrUtil.each(mapModelGroupBySeries, function(mapSeries, mapType) {
                var mapData = mapDataStores[mapType];
                if (!mapData) {
                    mapNotExistsError(name);
                }
                var nameMapList = zrUtil.map(mapSeries, function(singleMapSeries) {
                    return singleMapSeries.get("nameMap");
                });
                var geo = new Geo(mapType, mapType, mapData && mapData.geoJson, mapData && mapData.specialAreas, zrUtil.mergeAll(nameMapList));
                geoList.push(geo);
                geo.resize = resizeGeo;
                geo.resize(mapSeries[0], api);
                zrUtil.each(mapSeries, function(singleMapSeries) {
                    singleMapSeries.coordinateSystem = geo;
                    setGeoCoords(geo, singleMapSeries);
                });
            });
            return geoList;
        },
        registerMap: function(mapName, geoJson, specialAreas) {
            if (geoJson.geoJson && !geoJson.features) {
                specialAreas = geoJson.specialAreas;
                geoJson = geoJson.geoJson;
            }
            if (typeof geoJson === "string") {
                geoJson = typeof JSON !== "undefined" && JSON.parse ? JSON.parse(geoJson) : new Function("return (" + geoJson + ");")();
            }
            mapDataStores[mapName] = {
                geoJson: geoJson,
                specialAreas: specialAreas
            };
        },
        getMap: function(mapName) {
            return mapDataStores[mapName];
        }
    };
    var echarts = require("../../echarts");
    echarts.registerMap = geoCreator.registerMap;
    echarts.getMap = geoCreator.getMap;
    echarts.loadMap = function() {};
    echarts.registerCoordinateSystem("geo", geoCreator);
});