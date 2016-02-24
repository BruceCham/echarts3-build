define("crm-modules/common/echarts/component/dataZoom/typeDefaulter", [ "../../model/Component" ], function(require, exports, module) {
    require("../../model/Component").registerSubTypeDefaulter("dataZoom", function(option) {
        return "slider";
    });
});