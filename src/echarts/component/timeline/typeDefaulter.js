define("crm-modules/common/echarts/component/timeline/typeDefaulter", [ "../../model/Component" ], function(require, exports, module) {
    require("../../model/Component").registerSubTypeDefaulter("timeline", function() {
        return "slider";
    });
});