define("crm-modules/common/echarts/zrender/animation/Clip", [ "./easing" ], function(require, exports, module) {
    var easingFuncs = require("./easing");
    function Clip(options) {
        this._target = options.target;
        this._life = options.life || 1e3;
        this._delay = options.delay || 0;
        this._initialized = false;
        this.loop = options.loop == null ? false : options.loop;
        this.gap = options.gap || 0;
        this.easing = options.easing || "Linear";
        this.onframe = options.onframe;
        this.ondestroy = options.ondestroy;
        this.onrestart = options.onrestart;
    }
    Clip.prototype = {
        constructor: Clip,
        step: function(time) {
            if (!this._initialized) {
                this._startTime = new Date().getTime() + this._delay;
                this._initialized = true;
            }
            var percent = (time - this._startTime) / this._life;
            if (percent < 0) {
                return;
            }
            percent = Math.min(percent, 1);
            var easing = this.easing;
            var easingFunc = typeof easing == "string" ? easingFuncs[easing] : easing;
            var schedule = typeof easingFunc === "function" ? easingFunc(percent) : percent;
            this.fire("frame", schedule);
            if (percent == 1) {
                if (this.loop) {
                    this.restart();
                    return "restart";
                }
                this._needsRemove = true;
                return "destroy";
            }
            return null;
        },
        restart: function() {
            var time = new Date().getTime();
            var remainder = (time - this._startTime) % this._life;
            this._startTime = new Date().getTime() - remainder + this.gap;
            this._needsRemove = false;
        },
        fire: function(eventType, arg) {
            eventType = "on" + eventType;
            if (this[eventType]) {
                this[eventType](this._target, arg);
            }
        }
    };
    return Clip;
});