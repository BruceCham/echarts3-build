define("crm-modules/common/echarts/zrender/core/event", [ "../mixin/Eventful" ], function(require, exports, module) {
    "use strict";
    var Eventful = require("../mixin/Eventful");
    var isDomLevel2 = typeof window !== "undefined" && !!window.addEventListener;
    function getBoundingClientRect(el) {
        return el.getBoundingClientRect ? el.getBoundingClientRect() : {
            left: 0,
            top: 0
        };
    }
    function normalizeEvent(el, e) {
        e = e || window.event;
        if (e.zrX != null) {
            return e;
        }
        var eventType = e.type;
        var isTouch = eventType && eventType.indexOf("touch") >= 0;
        if (!isTouch) {
            var mouseX = 0;
            var mouseY = 0;
            if (e.pageX || e.pageY) {
                mouseX = e.pageX;
                mouseY = e.pageY;
            } else {
                mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            var box = getBoundingClientRect(el);
            var top = box.top + (window.pageYOffset || el.scrollTop) - (el.clientTop || 0);
            var left = box.left + (window.pageXOffset || el.scrollLeft) - (el.clientLeft || 0);
            e.zrX = mouseX - left;
            e.zrY = mouseY - top;
            e.zrDelta = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
        } else {
            var touch = eventType != "touchend" ? e.targetTouches[0] : e.changedTouches[0];
            if (touch) {
                var rBounding = getBoundingClientRect(el);
                e.zrX = touch.clientX - rBounding.left;
                e.zrY = touch.clientY - rBounding.top;
            }
        }
        return e;
    }
    function addEventListener(el, name, handler) {
        if (isDomLevel2) {
            el.addEventListener(name, handler);
        } else {
            el.attachEvent("on" + name, handler);
        }
    }
    function removeEventListener(el, name, handler) {
        if (isDomLevel2) {
            el.removeEventListener(name, handler);
        } else {
            el.detachEvent("on" + name, handler);
        }
    }
    var stop = isDomLevel2 ? function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
    } : function(e) {
        e.returnValue = false;
        e.cancelBubble = true;
    };
    return {
        normalizeEvent: normalizeEvent,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        stop: stop,
        Dispatcher: Eventful
    };
});