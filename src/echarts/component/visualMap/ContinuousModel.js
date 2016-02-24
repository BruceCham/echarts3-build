define("crm-modules/common/echarts/component/visualMap/ContinuousModel", [ "./VisualMapModel", "crm-modules/common/echarts/zrender/core/util", "../../util/number" ], function(require, exports, module) {
    var VisualMapModel = require("./VisualMapModel");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var numberUtil = require("../../util/number");
    var DEFAULT_BAR_BOUND = [ 20, 140 ];
    return VisualMapModel.extend({
        type: "visualMap.continuous",
        defaultOption: {
            handlePosition: "auto",
            calculable: false,
            range: [ -Infinity, Infinity ],
            hoverLink: true,
            realtime: true,
            itemWidth: null,
            itemHeight: null
        },
        doMergeOption: function(newOption, isInit) {
            this.$superApply("doMergeOption", arguments);
            this.resetTargetSeries(newOption, isInit);
            this.resetExtent();
            this.resetVisual(function(mappingOption) {
                mappingOption.mappingMethod = "linear";
            });
            this._resetRange();
        },
        resetItemSize: function() {
            VisualMapModel.prototype.resetItemSize.apply(this, arguments);
            var itemSize = this.itemSize;
            this._orient === "horizontal" && itemSize.reverse();
            (itemSize[0] == null || isNaN(itemSize[0])) && (itemSize[0] = DEFAULT_BAR_BOUND[0]);
            (itemSize[1] == null || isNaN(itemSize[1])) && (itemSize[1] = DEFAULT_BAR_BOUND[1]);
        },
        _resetRange: function() {
            var dataExtent = this.getExtent();
            var range = this.option.range;
            if (range[0] > range[1]) {
                range.reverse();
            }
            range[0] = Math.max(range[0], dataExtent[0]);
            range[1] = Math.min(range[1], dataExtent[1]);
        },
        completeVisualOption: function() {
            VisualMapModel.prototype.completeVisualOption.apply(this, arguments);
            zrUtil.each(this.stateList, function(state) {
                var symbolSize = this.option.controller[state].symbolSize;
                if (symbolSize && symbolSize[0] !== symbolSize[1]) {
                    symbolSize[0] = 0;
                }
            }, this);
        },
        setSelected: function(selected) {
            this.option.range = selected.slice();
            this._resetRange();
        },
        getSelected: function() {
            var dataExtent = this.getExtent();
            var dataInterval = numberUtil.asc((this.get("range") || []).slice());
            dataInterval[0] > dataExtent[1] && (dataInterval[0] = dataExtent[1]);
            dataInterval[1] > dataExtent[1] && (dataInterval[1] = dataExtent[1]);
            dataInterval[0] < dataExtent[0] && (dataInterval[0] = dataExtent[0]);
            dataInterval[1] < dataExtent[0] && (dataInterval[1] = dataExtent[0]);
            return dataInterval;
        },
        getValueState: function(value) {
            var range = this.option.range;
            var dataExtent = this.getExtent();
            return (range[0] <= dataExtent[0] || range[0] <= value) && (range[1] >= dataExtent[1] || value <= range[1]) ? "inRange" : "outOfRange";
        }
    });
});