define("crm-modules/common/echarts/chart/helper/whiskerBoxCommon", [ "../../data/List", "../../data/helper/completeDimensions", "../helper/WhiskerBoxDraw" ], function(require, exports, module) {
    "use strict";
    var List = require("../../data/List");
    var completeDimensions = require("../../data/helper/completeDimensions");
    var WhiskerBoxDraw = require("../helper/WhiskerBoxDraw");
    function getItemValue(item) {
        return item.value == null ? item : item.value;
    }
    var seriesModelMixin = {
        _baseAxisDim: null,
        getInitialData: function(option, ecModel) {
            var categories;
            var xAxisModel = ecModel.getComponent("xAxis", this.get("xAxisIndex"));
            var yAxisModel = ecModel.getComponent("yAxis", this.get("yAxisIndex"));
            var xAxisType = xAxisModel.get("type");
            var yAxisType = yAxisModel.get("type");
            var addOrdinal;
            if (xAxisType === "category") {
                option.layout = "horizontal";
                categories = xAxisModel.getCategories();
                addOrdinal = true;
            } else if (yAxisType === "category") {
                option.layout = "vertical";
                categories = yAxisModel.getCategories();
                addOrdinal = true;
            } else {
                option.layout = option.layout || "horizontal";
            }
            this._baseAxisDim = option.layout === "horizontal" ? "x" : "y";
            var data = option.data;
            var dimensions = this.dimensions = [ "base" ].concat(this.valueDimensions);
            completeDimensions(dimensions, data);
            var list = new List(dimensions, this);
            list.initData(data, categories ? categories.slice() : null, function(dataItem, dimName, idx, dimIdx) {
                var value = getItemValue(dataItem);
                return addOrdinal ? dimName === "base" ? idx : value[dimIdx - 1] : value[dimIdx];
            });
            return list;
        },
        getDimensionsOnAxis: function(axisDim) {
            var dims = this.valueDimensions.slice();
            var baseDim = [ "base" ];
            var map = {
                horizontal: {
                    x: baseDim,
                    y: dims
                },
                vertical: {
                    x: dims,
                    y: baseDim
                }
            };
            return map[this.get("layout")][axisDim];
        },
        getBaseAxisModel: function() {
            var dim = this._baseAxisDim;
            return this.ecModel.getComponent(dim + "Axis", this.get(dim + "AxisIndex"));
        }
    };
    var viewMixin = {
        init: function() {
            var whiskerBoxDraw = this._whiskerBoxDraw = new WhiskerBoxDraw(this.getStyleUpdater());
            this.group.add(whiskerBoxDraw.group);
        },
        render: function(seriesModel, ecModel, api) {
            this._whiskerBoxDraw.updateData(seriesModel.getData());
        },
        remove: function(ecModel) {
            this._whiskerBoxDraw.remove();
        }
    };
    function queryDataIndex(data, payload) {
        if (payload.dataIndex != null) {
            return payload.dataIndex;
        } else if (payload.name != null) {
            return data.indexOfName(payload.name);
        }
    }
    return {
        seriesModelMixin: seriesModelMixin,
        viewMixin: viewMixin
    };
});