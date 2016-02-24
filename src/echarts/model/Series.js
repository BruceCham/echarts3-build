define("crm-modules/common/echarts/model/Series", [ "crm-modules/common/echarts/zrender/core/util", "../util/format", "../util/model", "./Component" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var formatUtil = require("../util/format");
    var modelUtil = require("../util/model");
    var ComponentModel = require("./Component");
    var encodeHTML = formatUtil.encodeHTML;
    var addCommas = formatUtil.addCommas;
    var SeriesModel = ComponentModel.extend({
        type: "series",
        seriesIndex: 0,
        coordinateSystem: null,
        defaultOption: null,
        legendDataProvider: null,
        init: function(option, parentModel, ecModel, extraOpt) {
            this.seriesIndex = this.componentIndex;
            this.mergeDefaultAndTheme(option, ecModel);
            this._dataBeforeProcessed = this.getInitialData(option, ecModel);
            this._data = this._dataBeforeProcessed.cloneShallow();
        },
        mergeDefaultAndTheme: function(option, ecModel) {
            zrUtil.merge(option, ecModel.getTheme().get(this.subType));
            zrUtil.merge(option, this.getDefaultOption());
            modelUtil.defaultEmphasis(option.label, [ "position", "show", "textStyle", "distance", "formatter" ]);
        },
        mergeOption: function(newSeriesOption, ecModel) {
            newSeriesOption = zrUtil.merge(this.option, newSeriesOption, true);
            var data = this.getInitialData(newSeriesOption, ecModel);
            if (data) {
                this._data = data;
                this._dataBeforeProcessed = data.cloneShallow();
            }
        },
        getInitialData: function() {},
        getData: function() {
            return this._data;
        },
        setData: function(data) {
            this._data = data;
        },
        getRawData: function() {
            return this._dataBeforeProcessed;
        },
        getRawDataArray: function() {
            return this.option.data;
        },
        getDimensionsOnAxis: function(axisDim) {
            return [ axisDim ];
        },
        formatTooltip: function(dataIndex, mutipleSeries) {
            var data = this._data;
            var value = this.getRawValue(dataIndex);
            var formattedValue = zrUtil.isArray(value) ? zrUtil.map(value, addCommas).join(", ") : addCommas(value);
            var name = data.getName(dataIndex);
            return !mutipleSeries ? encodeHTML(this.name) + "<br />" + (name ? encodeHTML(name) + " : " + formattedValue : formattedValue) : encodeHTML(this.name) + " : " + formattedValue;
        },
        restoreData: function() {
            this._data = this._dataBeforeProcessed.cloneShallow();
        }
    });
    zrUtil.mixin(SeriesModel, modelUtil.dataFormatMixin);
    return SeriesModel;
});