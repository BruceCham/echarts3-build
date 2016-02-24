define("crm-modules/common/echarts/component/polar", [ "../coord/polar/polarCreator", "./angleAxis", "./radiusAxis", "../echarts" ], function(require, exports, module) {
    "use strict";
    require("../coord/polar/polarCreator");
    require("./angleAxis");
    require("./radiusAxis");
    require("../echarts").extendComponentView({
        type: "polar"
    });
});