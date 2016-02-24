define("crm-modules/common/echarts/component/timeline", [ "../echarts", "./timeline/preprocessor", "./timeline/typeDefaulter", "./timeline/timelineAction", "./timeline/SliderTimelineModel", "./timeline/SliderTimelineView" ], function(require, exports, module) {
    var echarts = require("../echarts");
    echarts.registerPreprocessor(require("./timeline/preprocessor"));
    require("./timeline/typeDefaulter");
    require("./timeline/timelineAction");
    require("./timeline/SliderTimelineModel");
    require("./timeline/SliderTimelineView");
});