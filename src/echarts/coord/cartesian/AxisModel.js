define("crm-modules/common/echarts/coord/cartesian/AxisModel", [ "../../model/Component", "crm-modules/common/echarts/zrender/core/util", "../axisModelCreator", "../axisModelCommonMixin" ], function(require, exports, module) {
    "use strict";
    var ComponentModel = require("../../model/Component");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var axisModelCreator = require("../axisModelCreator");
    var AxisModel = ComponentModel.extend({
        type: "cartesian2dAxis",
        axis: null,
        setNeedsCrossZero: function(needs) {
            this.option.scale = !needs;
        },
        setMin: function(min) {
            this.option.min = min;
        },
        setMax: function(max) {
            this.option.max = max;
        }
    });
    function getAxisType(axisDim, option) {
        return option.type || (option.data ? "category" : "value");
    }
    zrUtil.merge(AxisModel.prototype, require("../axisModelCommonMixin"));
    var extraOption = {
        gridIndex: 0
    };
    axisModelCreator("x", AxisModel, getAxisType, extraOption);
    axisModelCreator("y", AxisModel, getAxisType, extraOption);
    return AxisModel;
});