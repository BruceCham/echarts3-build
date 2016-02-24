define("crm-modules/common/echarts/coord/polar/AxisModel", [ "crm-modules/common/echarts/zrender/core/util", "../../model/Component", "../axisModelCreator", "../axisModelCommonMixin" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var ComponentModel = require("../../model/Component");
    var axisModelCreator = require("../axisModelCreator");
    var PolarAxisModel = ComponentModel.extend({
        type: "polarAxis",
        axis: null
    });
    zrUtil.merge(PolarAxisModel.prototype, require("../axisModelCommonMixin"));
    var polarAxisDefaultExtendedOption = {
        angle: {
            polarIndex: 0,
            startAngle: 90,
            clockwise: true,
            splitNumber: 12,
            axisLabel: {
                rotate: false
            }
        },
        radius: {
            polarIndex: 0,
            splitNumber: 5
        }
    };
    function getAxisType(axisDim, option) {
        return option.type || (option.data ? "category" : "value");
    }
    axisModelCreator("angle", PolarAxisModel, getAxisType, polarAxisDefaultExtendedOption.angle);
    axisModelCreator("radius", PolarAxisModel, getAxisType, polarAxisDefaultExtendedOption.radius);
});