define("crm-modules/common/echarts/component/parallel", [ "../coord/parallel/parallelCreator", "../coord/parallel/ParallelModel", "./parallelAxis", "../echarts", "../coord/parallel/parallelPreprocessor" ], function(require, exports, module) {
    require("../coord/parallel/parallelCreator");
    require("../coord/parallel/ParallelModel");
    require("./parallelAxis");
    var echarts = require("../echarts");
    echarts.extendComponentView({
        type: "parallel"
    });
    echarts.registerPreprocessor(require("../coord/parallel/parallelPreprocessor"));
});