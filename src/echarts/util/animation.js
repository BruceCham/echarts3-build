define("crm-modules/common/echarts/util/animation", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    function createWrap() {
        var storage = [];
        var elExistsMap = {};
        var doneCallback;
        return {
            add: function(el, target, time, delay, easing) {
                if (zrUtil.isString(delay)) {
                    easing = delay;
                    delay = 0;
                }
                if (elExistsMap[el.id]) {
                    return false;
                }
                elExistsMap[el.id] = 1;
                storage.push({
                    el: el,
                    target: target,
                    time: time,
                    delay: delay,
                    easing: easing
                });
                return true;
            },
            done: function(callback) {
                doneCallback = callback;
                return this;
            },
            start: function() {
                var count = storage.length;
                for (var i = 0, len = storage.length; i < len; i++) {
                    var item = storage[i];
                    item.el.animateTo(item.target, item.time, item.delay, item.easing, done);
                }
                return this;
                function done() {
                    count--;
                    if (!count) {
                        storage.length = 0;
                        elExistsMap = {};
                        doneCallback && doneCallback();
                    }
                }
            }
        };
    }
    return {
        createWrap: createWrap
    };
});