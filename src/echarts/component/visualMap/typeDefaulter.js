define("crm-modules/common/echarts/component/visualMap/typeDefaulter", [ "../../model/Component" ], function(require, exports, module) {
    require("../../model/Component").registerSubTypeDefaulter("visualMap", function(option) {
        return !option.categories && (!(option.pieces ? option.pieces.length > 0 : option.splitNumber > 0) || option.calculable) ? "continuous" : "piecewise";
    });
});