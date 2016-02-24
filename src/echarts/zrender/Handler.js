define("crm-modules/common/echarts/zrender/Handler", [ "./core/env", "./core/event", "./core/util", "./mixin/Draggable", "./core/GestureMgr", "./mixin/Eventful" ], function(require, exports, module) {
    "use strict";
    var env = require("./core/env");
    var eventTool = require("./core/event");
    var util = require("./core/util");
    var Draggable = require("./mixin/Draggable");
    var GestureMgr = require("./core/GestureMgr");
    var Eventful = require("./mixin/Eventful");
    var domHandlerNames = [ "click", "dblclick", "mousewheel", "mousemove", "mouseout", "mouseup", "mousedown" ];
    var touchHandlerNames = [ "touchstart", "touchend", "touchmove" ];
    var TOUCH_CLICK_DELAY = 300;
    var addEventListener = eventTool.addEventListener;
    var removeEventListener = eventTool.removeEventListener;
    var normalizeEvent = eventTool.normalizeEvent;
    function proxyEventName(name) {
        return "_" + name + "Handler";
    }
    function makeEventPacket(eveType, target, event) {
        return {
            type: eveType,
            event: event,
            target: target,
            cancelBubble: false,
            offsetX: event.zrX,
            offsetY: event.zrY,
            gestureEvent: event.gestureEvent,
            pinchX: event.pinchX,
            pinchY: event.pinchY,
            pinchScale: event.pinchScale,
            wheelDelta: event.zrDelta
        };
    }
    var domHandlers = {
        mousemove: function(event) {
            event = normalizeEvent(this.root, event);
            var x = event.zrX;
            var y = event.zrY;
            var hovered = this._findHover(x, y, null);
            var lastHovered = this._hovered;
            this._hovered = hovered;
            this.root.style.cursor = hovered ? hovered.cursor : this._defaultCursorStyle;
            if (lastHovered && hovered !== lastHovered && lastHovered.__zr) {
                this._dispatchProxy(lastHovered, "mouseout", event);
            }
            this._dispatchProxy(hovered, "mousemove", event);
            if (hovered && hovered !== lastHovered) {
                this._dispatchProxy(hovered, "mouseover", event);
            }
        },
        mouseout: function(event) {
            event = normalizeEvent(this.root, event);
            var element = event.toElement || event.relatedTarget;
            if (element != this.root) {
                while (element && element.nodeType != 9) {
                    if (element === this.root) {
                        return;
                    }
                    element = element.parentNode;
                }
            }
            this._dispatchProxy(this._hovered, "mouseout", event);
            this.trigger("globalout", {
                event: event
            });
        },
        touchstart: function(event) {
            event = normalizeEvent(this.root, event);
            this._lastTouchMoment = new Date();
            processGesture(this, event, "start");
            this._mousemoveHandler(event);
            this._mousedownHandler(event);
        },
        touchmove: function(event) {
            event = normalizeEvent(this.root, event);
            processGesture(this, event, "change");
            this._mousemoveHandler(event);
        },
        touchend: function(event) {
            event = normalizeEvent(this.root, event);
            processGesture(this, event, "end");
            this._mouseupHandler(event);
            if (+new Date() - this._lastTouchMoment < TOUCH_CLICK_DELAY) {
                this._clickHandler(event);
            }
        }
    };
    util.each([ "click", "mousedown", "mouseup", "mousewheel", "dblclick" ], function(name) {
        domHandlers[name] = function(event) {
            event = normalizeEvent(this.root, event);
            var hovered = this._findHover(event.zrX, event.zrY, null);
            this._dispatchProxy(hovered, name, event);
        };
    });
    function processGesture(zrHandler, event, stage) {
        var gestureMgr = zrHandler._gestureMgr;
        stage === "start" && gestureMgr.clear();
        var gestureInfo = gestureMgr.recognize(event, zrHandler._findHover(event.zrX, event.zrY, null));
        stage === "end" && gestureMgr.clear();
        if (gestureInfo) {
            var type = gestureInfo.type;
            event.gestureEvent = type;
            zrHandler._dispatchProxy(gestureInfo.target, type, gestureInfo.event);
        }
    }
    function initDomHandler(instance) {
        var handlerNames = domHandlerNames.concat(touchHandlerNames);
        var len = handlerNames.length;
        while (len--) {
            var name = handlerNames[len];
            instance[proxyEventName(name)] = util.bind(domHandlers[name], instance);
        }
    }
    var Handler = function(root, storage, painter) {
        Eventful.call(this);
        this.root = root;
        this.storage = storage;
        this.painter = painter;
        this._hovered;
        this._lastTouchMoment;
        this._lastX;
        this._lastY;
        this._defaultCursorStyle = "default";
        this._gestureMgr = new GestureMgr();
        initDomHandler(this);
        if (env.os.tablet || env.os.phone) {
            util.each(touchHandlerNames, function(name) {
                addEventListener(root, name, this[proxyEventName(name)]);
            }, this);
            addEventListener(root, "mouseout", this._mouseoutHandler);
        } else {
            util.each(domHandlerNames, function(name) {
                addEventListener(root, name, this[proxyEventName(name)]);
            }, this);
            addEventListener(root, "DOMMouseScroll", this._mousewheelHandler);
        }
        Draggable.call(this);
    };
    Handler.prototype = {
        constructor: Handler,
        resize: function(event) {
            this._hovered = null;
        },
        dispatch: function(eventName, eventArgs) {
            var handler = this[proxyEventName(eventName)];
            handler && handler(eventArgs);
        },
        dispose: function() {
            var root = this.root;
            var handlerNames = domHandlerNames.concat(touchHandlerNames);
            for (var i = 0; i < handlerNames.length; i++) {
                var name = handlerNames[i];
                removeEventListener(root, name, this[proxyEventName(name)]);
            }
            removeEventListener(root, "DOMMouseScroll", this._mousewheelHandler);
            this.root = this.storage = this.painter = null;
        },
        setDefaultCursorStyle: function(cursorStyle) {
            this._defaultCursorStyle = cursorStyle;
        },
        _dispatchProxy: function(targetEl, eventName, event) {
            var eventHandler = "on" + eventName;
            var eventPacket = makeEventPacket(eventName, targetEl, event);
            var el = targetEl;
            while (el) {
                el[eventHandler] && (eventPacket.cancelBubble = el[eventHandler].call(el, eventPacket));
                el.trigger(eventName, eventPacket);
                el = el.parent;
                if (eventPacket.cancelBubble) {
                    break;
                }
            }
            if (!eventPacket.cancelBubble) {
                this.trigger(eventName, eventPacket);
                this.painter && this.painter.eachOtherLayer(function(layer) {
                    if (typeof layer[eventHandler] == "function") {
                        layer[eventHandler].call(layer, eventPacket);
                    }
                    if (layer.trigger) {
                        layer.trigger(eventName, eventPacket);
                    }
                });
            }
        },
        _findHover: function(x, y, exclude) {
            var list = this.storage.getDisplayList();
            for (var i = list.length - 1; i >= 0; i--) {
                if (!list[i].silent && list[i] !== exclude && isHover(list[i], x, y)) {
                    return list[i];
                }
            }
        }
    };
    function isHover(displayable, x, y) {
        if (displayable[displayable.rectHover ? "rectContain" : "contain"](x, y)) {
            var p = displayable.parent;
            while (p) {
                if (p.clipPath && !p.clipPath.contain(x, y)) {
                    return false;
                }
                p = p.parent;
            }
            return true;
        }
        return false;
    }
    util.mixin(Handler, Eventful);
    util.mixin(Handler, Draggable);
    return Handler;
});