define("crm-modules/common/echarts/coord/single/AxisModel", [ "../../model/Component", "../axisModelCreator", "crm-modules/common/echarts/zrender/core/util", "../axisModelCommonMixin" ], function(require, exports, module) {
    var ComponentModel = require("../../model/Component");
    var axisModelCreator = require("../axisModelCreator");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var AxisModel = ComponentModel.extend({
        type: "singleAxis",
        layoutMode: "box",
        axis: null,
        coordinateSystem: null
    });
    var defaultOption = {
        left: "5%",
        top: "5%",
        right: "5%",
        bottom: "5%",
        type: "value",
        position: "bottom",
        orient: "horizontal",
        singleIndex: 0,
        axisLine: {
            show: true,
            lineStyle: {
                width: 2,
                type: "solid"
            }
        },
        axisTick: {
            show: true,
            length: 6,
            lineStyle: {
                width: 2
            }
        },
        axisLabel: {
            show: true,
            interval: "auto"
        },
        splitLine: {
            show: true,
            lineStyle: {
                type: "dashed",
                opacity: .2
            }
        }
    };
    function getAxisType(axisName, option) {
        return option.type || (option.data ? "category" : "value");
    }
    zrUtil.merge(AxisModel.prototype, require("../axisModelCommonMixin"));
    axisModelCreator("single", AxisModel, getAxisType, defaultOption);
    return AxisModel;
});