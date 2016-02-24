define("crm-modules/common/echarts/component/toolbox", [ "./toolbox/ToolboxModel", "./toolbox/ToolboxView", "./toolbox/feature/SaveAsImage", "./toolbox/feature/MagicType", "./toolbox/feature/DataView", "./toolbox/feature/Restore" ], function(require, exports, module) {
    require("./toolbox/ToolboxModel");
    require("./toolbox/ToolboxView");
    require("./toolbox/feature/SaveAsImage");
    require("./toolbox/feature/MagicType");
    require("./toolbox/feature/DataView");
    require("./toolbox/feature/Restore");
});