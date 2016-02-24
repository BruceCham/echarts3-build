define("crm-modules/common/echarts/chart/map/MapSeries", [ "../../data/List", "../../echarts", "../../model/Series", "crm-modules/common/echarts/zrender/core/util", "../../data/helper/completeDimensions", "../../util/format", "../helper/dataSelectableMixin" ], function(require, exports, module) {
    var List = require("../../data/List");
    var echarts = require("../../echarts");
    var SeriesModel = require("../../model/Series");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var completeDimensions = require("../../data/helper/completeDimensions");
    var formatUtil = require("../../util/format");
    var encodeHTML = formatUtil.encodeHTML;
    var addCommas = formatUtil.addCommas;
    var dataSelectableMixin = require("../helper/dataSelectableMixin");
    function fillData(dataOpt, geoJson) {
        var dataNameMap = {};
        var features = geoJson.features;
        for (var i = 0; i < dataOpt.length; i++) {
            dataNameMap[dataOpt[i].name] = dataOpt[i];
        }
        for (var i = 0; i < features.length; i++) {
            var name = features[i].properties.name;
            if (!dataNameMap[name]) {
                dataOpt.push({
                    value: NaN,
                    name: name
                });
            }
        }
        return dataOpt;
    }
    var MapSeries = SeriesModel.extend({
        type: "series.map",
        needsDrawMap: false,
        seriesGroup: [],
        init: function(option) {
            option = this._fillOption(option);
            this.option = option;
            this.$superApply("init", arguments);
            this.updateSelectedMap();
        },
        getInitialData: function(option) {
            var dimensions = completeDimensions([ "value" ], option.data || []);
            var list = new List(dimensions, this);
            list.initData(option.data);
            return list;
        },
        mergeOption: function(newOption) {
            newOption = this._fillOption(newOption);
            SeriesModel.prototype.mergeOption.call(this, newOption);
            this.updateSelectedMap();
        },
        _fillOption: function(option) {
            option = zrUtil.extend({}, option);
            var map = echarts.getMap(option.mapType);
            var geoJson = map && map.geoJson;
            geoJson && option.data && (option.data = fillData(option.data, geoJson));
            return option;
        },
        setRoamZoom: function(zoom) {
            var roamDetail = this.option.roamDetail;
            roamDetail && (roamDetail.zoom = zoom);
        },
        setRoamPan: function(x, y) {
            var roamDetail = this.option.roamDetail;
            if (roamDetail) {
                roamDetail.x = x;
                roamDetail.y = y;
            }
        },
        formatTooltip: function(dataIndex) {
            var data = this._data;
            var formattedValue = addCommas(this.getRawValue(dataIndex));
            var name = data.getName(dataIndex);
            var seriesGroup = this.seriesGroup;
            var seriesNames = [];
            for (var i = 0; i < seriesGroup.length; i++) {
                if (!isNaN(seriesGroup[i].getRawValue(dataIndex))) {
                    seriesNames.push(encodeHTML(seriesGroup[i].name));
                }
            }
            return seriesNames.join(", ") + "<br />" + name + " : " + formattedValue;
        },
        defaultOption: {
            zlevel: 0,
            z: 2,
            coordinateSystem: "geo",
            map: "china",
            left: "center",
            top: "center",
            showLegendSymbol: true,
            dataRangeHoverLink: true,
            roamDetail: {
                x: 0,
                y: 0,
                zoom: 1
            },
            label: {
                normal: {
                    show: false,
                    textStyle: {
                        color: "#000"
                    }
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        color: "#000"
                    }
                }
            },
            itemStyle: {
                normal: {
                    borderWidth: .5,
                    borderColor: "#444",
                    areaColor: "#eee"
                },
                emphasis: {
                    areaColor: "rgba(255,215, 0, 0.8)"
                }
            }
        }
    });
    zrUtil.mixin(MapSeries, dataSelectableMixin);
    return MapSeries;
});