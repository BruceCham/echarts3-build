define("crm-modules/common/echarts/component/single", [ "../coord/single/singleCreator", "./singleAxis", "../echarts" ], function(require, exports, module) {
    require("../coord/single/singleCreator");
    require("./singleAxis");
    var echarts = require("../echarts");
    echarts.extendComponentView({
        type: "single"
    });
});