define("crm-modules/common/echarts/coord/geo/Geo", [ "./parseGeoJson", "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/core/BoundingRect", "../View", "./fix/nanhai", "./fix/textCoord", "./fix/geoCoord" ], function(require, exports, module) {
    var parseGeoJson = require("./parseGeoJson");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var BoundingRect = require("crm-modules/common/echarts/zrender/core/BoundingRect");
    var View = require("../View");
    var geoFixFuncs = [ require("./fix/nanhai"), require("./fix/textCoord"), require("./fix/geoCoord") ];
    function Geo(name, map, geoJson, specialAreas, nameMap) {
        View.call(this, name);
        this.map = map;
        this._nameCoordMap = {};
        this.loadGeoJson(geoJson, specialAreas, nameMap);
    }
    Geo.prototype = {
        constructor: Geo,
        type: "geo",
        dimensions: [ "lng", "lat" ],
        loadGeoJson: function(geoJson, specialAreas, nameMap) {
            try {
                this.regions = geoJson ? parseGeoJson(geoJson) : [];
            } catch (e) {
                throw "Invalid geoJson format\n" + e;
            }
            specialAreas = specialAreas || {};
            nameMap = nameMap || {};
            var regions = this.regions;
            var regionsMap = {};
            for (var i = 0; i < regions.length; i++) {
                var regionName = regions[i].name;
                regionName = nameMap[regionName] || regionName;
                regions[i].name = regionName;
                regionsMap[regionName] = regions[i];
                this.addGeoCoord(regionName, regions[i].center);
                var specialArea = specialAreas[regionName];
                if (specialArea) {
                    regions[i].transformTo(specialArea.left, specialArea.top, specialArea.width, specialArea.height);
                }
            }
            this._regionsMap = regionsMap;
            this._rect = null;
            zrUtil.each(geoFixFuncs, function(fixFunc) {
                fixFunc(this);
            }, this);
        },
        transformTo: function(x, y, width, height) {
            var rect = this.getBoundingRect();
            rect = rect.clone();
            rect.y = -rect.y - rect.height;
            var viewTransform = this._viewTransform;
            viewTransform.transform = rect.calculateTransform(new BoundingRect(x, y, width, height));
            viewTransform.decomposeTransform();
            var scale = viewTransform.scale;
            scale[1] = -scale[1];
            viewTransform.updateTransform();
            this._updateTransform();
        },
        getRegion: function(name) {
            return this._regionsMap[name];
        },
        addGeoCoord: function(name, geoCoord) {
            this._nameCoordMap[name] = geoCoord;
        },
        getGeoCoord: function(name) {
            return this._nameCoordMap[name];
        },
        getBoundingRect: function() {
            if (this._rect) {
                return this._rect;
            }
            var rect;
            var regions = this.regions;
            for (var i = 0; i < regions.length; i++) {
                var regionRect = regions[i].getBoundingRect();
                rect = rect || regionRect.clone();
                rect.union(regionRect);
            }
            return this._rect = rect || new BoundingRect(0, 0, 0, 0);
        },
        dataToPoints: function(data) {
            var item = [];
            return data.mapArray([ "lng", "lat" ], function(lon, lat) {
                item[0] = lon;
                item[1] = lat;
                return this.dataToPoint(item);
            }, this);
        },
        dataToPoint: function(data) {
            if (typeof data === "string") {
                data = this.getGeoCoord(data);
            }
            if (data) {
                return View.prototype.dataToPoint.call(this, data);
            }
        }
    };
    zrUtil.mixin(Geo, View);
    return Geo;
});