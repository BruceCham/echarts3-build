define("crm-modules/common/echarts/util/throttle", [], function(require, exports, module) {
    var lib = {};
    var ORIGIN_METHOD = "\0__throttleOriginMethod";
    var RATE = "\0__throttleRate";
    lib.throttle = function(fn, delay, trailing, debounce) {
        var currCall = new Date().getTime();
        var lastCall = 0;
        var lastExec = 0;
        var timer = null;
        var diff;
        var scope;
        var args;
        var isSingle = typeof fn === "function";
        delay = delay || 0;
        if (isSingle) {
            return createCallback();
        } else {
            var ret = [];
            for (var i = 0; i < fn.length; i++) {
                ret[i] = createCallback(i);
            }
            return ret;
        }
        function createCallback(index) {
            function exec() {
                lastExec = new Date().getTime();
                timer = null;
                (isSingle ? fn : fn[index]).apply(scope, args || []);
            }
            var cb = function() {
                currCall = new Date().getTime();
                scope = this;
                args = arguments;
                diff = currCall - (debounce ? lastCall : lastExec) - delay;
                clearTimeout(timer);
                if (debounce) {
                    if (trailing) {
                        timer = setTimeout(exec, delay);
                    } else if (diff >= 0) {
                        exec();
                    }
                } else {
                    if (diff >= 0) {
                        exec();
                    } else if (trailing) {
                        timer = setTimeout(exec, -diff);
                    }
                }
                lastCall = currCall;
            };
            cb.clear = function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            };
            return cb;
        }
    };
    lib.fixRate = function(fn, delay) {
        return delay != null ? lib.throttle(fn, delay, true, false) : fn;
    };
    lib.debounce = function(fn, delay) {
        return delay != null ? lib.throttle(fn, delay, true, true) : fn;
    };
    lib.createOrUpdate = function(obj, fnAttr, rate, throttleType) {
        var fn = obj[fnAttr];
        if (!fn || rate == null || !throttleType) {
            return;
        }
        var originFn = fn[ORIGIN_METHOD] || fn;
        var lastRate = fn[RATE];
        if (lastRate !== rate) {
            fn = obj[fnAttr] = lib[throttleType](originFn, rate);
            fn[ORIGIN_METHOD] = originFn;
            fn[RATE] = rate;
        }
    };
    lib.clear = function(obj, fnAttr) {
        var fn = obj[fnAttr];
        if (fn && fn[ORIGIN_METHOD]) {
            obj[fnAttr] = fn[ORIGIN_METHOD];
        }
    };
    return lib;
});