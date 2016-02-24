define("crm-modules/common/echarts/coord/parallel/AxisModel", [ "../../model/Component", "crm-modules/common/echarts/zrender/core/util", "../../model/mixin/makeStyleMapper", "../axisModelCreator", "../../util/number", "../axisModelCommonMixin" ], function(require, exports, module) {
    var ComponentModel = require("../../model/Component");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var makeStyleMapper = require("../../model/mixin/makeStyleMapper");
    var axisModelCreator = require("../axisModelCreator");
    var numberUtil = require("../../util/number");
    var AxisModel = ComponentModel.extend({
        type: "baseParallelAxis",
        axis: null,
        activeIntervals: [],
        getAreaSelectStyle: function() {
            return makeStyleMapper([ [ "fill", "color" ], [ "lineWidth", "borderWidth" ], [ "stroke", "borderColor" ], [ "width", "width" ], [ "opacity", "opacity" ] ]).call(this.getModel("areaSelectStyle"));
        },
        setActiveIntervals: function(intervals) {
            var activeIntervals = this.activeIntervals = zrUtil.clone(intervals);
            if (activeIntervals) {
                for (var i = activeIntervals.length - 1; i >= 0; i--) {
                    numberUtil.asc(activeIntervals[i]);
                }
            }
        },
        getActiveState: function(value) {
            var activeIntervals = this.activeIntervals;
            if (!activeIntervals.length) {
                return "normal";
            }
            if (value == null) {
                return "inactive";
            }
            for (var i = 0, len = activeIntervals.length; i < len; i++) {
                if (activeIntervals[i][0] <= value && value <= activeIntervals[i][1]) {
                    return "active";
                }
            }
            return "inactive";
        }
    });
    var defaultOption = {
        type: "value",
        dim: null,
        parallelIndex: null,
        areaSelectStyle: {
            width: 20,
            borderWidth: 1,
            borderColor: "rgba(160,197,232)",
            color: "rgba(160,197,232)",
            opacity: .3
        },
        z: 10
    };
    zrUtil.merge(AxisModel.prototype, require("../axisModelCommonMixin"));
    function getAxisType(axisName, option) {
        return option.type || (option.data ? "category" : "value");
    }
    axisModelCreator("parallel", AxisModel, getAxisType, defaultOption);
    return AxisModel;
});