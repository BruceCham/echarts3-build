define("crm-modules/common/echarts/component/toolbox/featureManager", [], function(require, exports, module) {
    "use strict";
    var features = {};
    return {
        register: function(name, ctor) {
            features[name] = ctor;
        },
        get: function(name) {
            return features[name];
        }
    };
});