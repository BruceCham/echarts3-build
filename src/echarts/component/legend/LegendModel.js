define("crm-modules/common/echarts/component/legend/LegendModel", [ "crm-modules/common/echarts/zrender/core/util", "../../model/Model", "../../echarts" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Model = require("../../model/Model");
    return require("../../echarts").extendComponentModel({
        type: "legend",
        dependencies: [ "series" ],
        layoutMode: {
            type: "box",
            ignoreSize: true
        },
        init: function(option, parentModel, ecModel) {
            this.mergeDefaultAndTheme(option, ecModel);
            option.selected = option.selected || {};
            this._updateData(ecModel);
            var legendData = this._data;
            var selectedMap = this.option.selected;
            if (legendData[0] && this.get("selectedMode") === "single") {
                var hasSelected = false;
                for (var name in selectedMap) {
                    if (selectedMap[name]) {
                        this.select(name);
                        hasSelected = true;
                    }
                }
                !hasSelected && this.select(legendData[0].get("name"));
            }
        },
        mergeOption: function(option) {
            this.$superCall("mergeOption", option);
            this._updateData(this.ecModel);
        },
        _updateData: function(ecModel) {
            var legendData = zrUtil.map(this.get("data") || [], function(dataItem) {
                if (typeof dataItem === "string") {
                    dataItem = {
                        name: dataItem
                    };
                }
                return new Model(dataItem, this, this.ecModel);
            }, this);
            this._data = legendData;
            var availableNames = zrUtil.map(ecModel.getSeries(), function(series) {
                return series.name;
            });
            ecModel.eachSeries(function(seriesModel) {
                if (seriesModel.legendDataProvider) {
                    var data = seriesModel.legendDataProvider();
                    availableNames = availableNames.concat(data.mapArray(data.getName));
                }
            });
            this._availableNames = availableNames;
        },
        getData: function() {
            return this._data;
        },
        select: function(name) {
            var selected = this.option.selected;
            var selectedMode = this.get("selectedMode");
            if (selectedMode === "single") {
                var data = this._data;
                zrUtil.each(data, function(dataItem) {
                    selected[dataItem.get("name")] = false;
                });
            }
            selected[name] = true;
        },
        unSelect: function(name) {
            if (this.get("selectedMode") !== "single") {
                this.option.selected[name] = false;
            }
        },
        toggleSelected: function(name) {
            var selected = this.option.selected;
            if (!(name in selected)) {
                selected[name] = true;
            }
            this[selected[name] ? "unSelect" : "select"](name);
        },
        isSelected: function(name) {
            var selected = this.option.selected;
            return !(name in selected && !selected[name]) && zrUtil.indexOf(this._availableNames, name) >= 0;
        },
        defaultOption: {
            zlevel: 0,
            z: 4,
            show: true,
            orient: "horizontal",
            left: "center",
            top: "top",
            align: "auto",
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "#ccc",
            borderWidth: 0,
            padding: 5,
            itemGap: 10,
            itemWidth: 25,
            itemHeight: 14,
            textStyle: {
                color: "#333"
            },
            selectedMode: true
        }
    });
});