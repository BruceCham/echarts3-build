define("crm-modules/common/echarts/component/timeline/TimelineView", [ "../../view/Component" ], function(require, exports, module) {
    var ComponentView = require("../../view/Component");
    return ComponentView.extend({
        type: "timeline"
    });
});