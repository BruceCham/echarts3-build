define("crm-modules/common/echarts/zrender/zrender", [ "./core/guid", "./core/env", "./Handler", "./Storage", "./animation/Animation", "./Painter" ], function(require, exports, module) {
    var guid = require("./core/guid");
    var env = require("./core/env");
    var Handler = require("./Handler");
    var Storage = require("./Storage");
    var Animation = require("./animation/Animation");
    var useVML = !env.canvasSupported;
    var painterCtors = {
        canvas: require("./Painter")
    };
    var instances = {};
    var zrender = {};
    zrender.version = "3.0.1";
    zrender.init = function(dom, opts) {
        var zr = new ZRender(guid(), dom, opts);
        instances[zr.id] = zr;
        return zr;
    };
    zrender.dispose = function(zr) {
        if (zr) {
            zr.dispose();
        } else {
            for (var key in instances) {
                instances[key].dispose();
            }
            instances = {};
        }
        return zrender;
    };
    zrender.getInstance = function(id) {
        return instances[id];
    };
    zrender.registerPainter = function(name, Ctor) {
        painterCtors[name] = Ctor;
    };
    function delInstance(id) {
        delete instances[id];
    }
    var ZRender = function(id, dom, opts) {
        opts = opts || {};
        this.dom = dom;
        this.id = id;
        var self = this;
        var storage = new Storage();
        var rendererType = opts.renderer;
        if (useVML) {
            if (!painterCtors.vml) {
                throw new Error("You need to require 'zrender/vml/vml' to support IE8");
            }
            rendererType = "vml";
        } else if (!rendererType || !painterCtors[rendererType]) {
            rendererType = "canvas";
        }
        var painter = new painterCtors[rendererType](dom, storage, opts);
        this.storage = storage;
        this.painter = painter;
        if (!env.node) {
            this.handler = new Handler(painter.getViewportRoot(), storage, painter);
        }
        this.animation = new Animation({
            stage: {
                update: function() {
                    if (self._needsRefresh) {
                        self.refreshImmediately();
                    }
                }
            }
        });
        this.animation.start();
        this._needsRefresh;
        var oldDelFromMap = storage.delFromMap;
        var oldAddToMap = storage.addToMap;
        storage.delFromMap = function(elId) {
            var el = storage.get(elId);
            oldDelFromMap.call(storage, elId);
            el && el.removeSelfFromZr(self);
        };
        storage.addToMap = function(el) {
            oldAddToMap.call(storage, el);
            el.addSelfToZr(self);
        };
    };
    ZRender.prototype = {
        constructor: ZRender,
        getId: function() {
            return this.id;
        },
        add: function(el) {
            this.storage.addRoot(el);
            this._needsRefresh = true;
        },
        remove: function(el) {
            this.storage.delRoot(el);
            this._needsRefresh = true;
        },
        configLayer: function(zLevel, config) {
            this.painter.configLayer(zLevel, config);
            this._needsRefresh = true;
        },
        refreshImmediately: function() {
            this._needsRefresh = false;
            this.painter.refresh();
            this._needsRefresh = false;
        },
        refresh: function() {
            this._needsRefresh = true;
        },
        resize: function() {
            this.painter.resize();
            this.handler && this.handler.resize();
        },
        clearAnimation: function() {
            this.animation.clear();
        },
        getWidth: function() {
            return this.painter.getWidth();
        },
        getHeight: function() {
            return this.painter.getHeight();
        },
        toDataURL: function(type, backgroundColor, args) {
            return this.painter.toDataURL(type, backgroundColor, args);
        },
        pathToImage: function(e, width, height) {
            var id = guid();
            return this.painter.pathToImage(id, e, width, height);
        },
        setDefaultCursorStyle: function(cursorStyle) {
            this.handler.setDefaultCursorStyle(cursorStyle);
        },
        on: function(eventName, eventHandler, context) {
            this.handler && this.handler.on(eventName, eventHandler, context);
        },
        off: function(eventName, eventHandler) {
            this.handler && this.handler.off(eventName, eventHandler);
        },
        trigger: function(eventName, event) {
            this.handler && this.handler.trigger(eventName, event);
        },
        clear: function() {
            this.storage.delRoot();
            this.painter.clear();
        },
        dispose: function() {
            this.animation.stop();
            this.clear();
            this.storage.dispose();
            this.painter.dispose();
            this.handler && this.handler.dispose();
            this.animation = this.storage = this.painter = this.handler = null;
            delInstance(this.id);
        }
    };
    return zrender;
});