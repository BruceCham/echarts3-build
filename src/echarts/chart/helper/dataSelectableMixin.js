define("crm-modules/common/echarts/chart/helper/dataSelectableMixin", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    return {
        updateSelectedMap: function() {
            var option = this.option;
            this._dataOptMap = zrUtil.reduce(option.data, function(dataOptMap, dataOpt) {
                dataOptMap[dataOpt.name] = dataOpt;
                return dataOptMap;
            }, {});
        },
        select: function(name) {
            var dataOptMap = this._dataOptMap;
            var dataOpt = dataOptMap[name];
            var selectedMode = this.get("selectedMode");
            if (selectedMode === "single") {
                zrUtil.each(dataOptMap, function(dataOpt) {
                    dataOpt.selected = false;
                });
            }
            dataOpt && (dataOpt.selected = true);
        },
        unSelect: function(name) {
            var dataOpt = this._dataOptMap[name];
            dataOpt && (dataOpt.selected = false);
        },
        toggleSelected: function(name) {
            var dataOpt = this._dataOptMap[name];
            if (dataOpt != null) {
                this[dataOpt.selected ? "unSelect" : "select"](name);
                return dataOpt.selected;
            }
        },
        isSelected: function(name) {
            var dataOpt = this._dataOptMap[name];
            return dataOpt && dataOpt.selected;
        }
    };
});