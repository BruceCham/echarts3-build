define("crm-modules/common/echarts/zrender/Painter", [ "./config", "./core/util", "./core/log", "./core/BoundingRect", "./Layer", "./graphic/Image" ], function(require, exports, module) {
    "use strict";
    var config = require("./config");
    var util = require("./core/util");
    var log = require("./core/log");
    var BoundingRect = require("./core/BoundingRect");
    var Layer = require("./Layer");
    function parseInt10(val) {
        return parseInt(val, 10);
    }
    function isLayerValid(layer) {
        if (!layer) {
            return false;
        }
        if (layer.isBuildin) {
            return true;
        }
        if (typeof layer.resize !== "function" || typeof layer.refresh !== "function") {
            return false;
        }
        return true;
    }
    function preProcessLayer(layer) {
        layer.__unusedCount++;
    }
    function postProcessLayer(layer) {
        layer.__dirty = false;
        if (layer.__unusedCount == 1) {
            layer.clear();
        }
    }
    var tmpRect = new BoundingRect(0, 0, 0, 0);
    var viewRect = new BoundingRect(0, 0, 0, 0);
    function isDisplayableCulled(el, width, height) {
        tmpRect.copy(el.getBoundingRect());
        if (el.transform) {
            tmpRect.applyTransform(el.transform);
        }
        viewRect.width = width;
        viewRect.height = height;
        return !tmpRect.intersect(viewRect);
    }
    function isClipPathChanged(clipPaths, prevClipPaths) {
        if (!clipPaths || !prevClipPaths || clipPaths.length !== prevClipPaths.length) {
            return true;
        }
        for (var i = 0; i < clipPaths.length; i++) {
            if (clipPaths[i] !== prevClipPaths[i]) {
                return true;
            }
        }
    }
    function doClip(clipPaths, ctx) {
        for (var i = 0; i < clipPaths.length; i++) {
            var clipPath = clipPaths[i];
            var m;
            if (clipPath.transform) {
                m = clipPath.transform;
                ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }
            var path = clipPath.path;
            path.beginPath(ctx);
            clipPath.buildPath(path, clipPath.shape);
            ctx.clip();
            if (clipPath.transform) {
                m = clipPath.invTransform;
                ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }
        }
    }
    var Painter = function(root, storage, opts) {
        var singleCanvas = !root.nodeName || root.nodeName.toUpperCase() === "CANVAS";
        opts = opts || {};
        this.dpr = opts.devicePixelRatio || config.devicePixelRatio;
        this._singleCanvas = singleCanvas;
        this.root = root;
        var rootStyle = root.style;
        if (rootStyle) {
            rootStyle["-webkit-tap-highlight-color"] = "transparent";
            rootStyle["-webkit-user-select"] = "none";
            rootStyle["user-select"] = "none";
            rootStyle["-webkit-touch-callout"] = "none";
            root.innerHTML = "";
        }
        this.storage = storage;
        if (!singleCanvas) {
            var width = this._getWidth();
            var height = this._getHeight();
            this._width = width;
            this._height = height;
            var domRoot = document.createElement("div");
            this._domRoot = domRoot;
            var domRootStyle = domRoot.style;
            domRootStyle.position = "relative";
            domRootStyle.overflow = "hidden";
            domRootStyle.width = this._width + "px";
            domRootStyle.height = this._height + "px";
            root.appendChild(domRoot);
            this._layers = {};
            this._zlevelList = [];
        } else {
            var width = root.width;
            var height = root.height;
            this._width = width;
            this._height = height;
            var mainLayer = new Layer(root, this, 1);
            mainLayer.initContext();
            this._layers = {
                0: mainLayer
            };
            this._zlevelList = [ 0 ];
        }
        this._layerConfig = {};
        this.pathToImage = this._createPathToImage();
    };
    Painter.prototype = {
        constructor: Painter,
        isSingleCanvas: function() {
            return this._singleCanvas;
        },
        getViewportRoot: function() {
            return this._singleCanvas ? this._layers[0].dom : this._domRoot;
        },
        refresh: function(paintAll) {
            var list = this.storage.getDisplayList(true);
            var zlevelList = this._zlevelList;
            this._paintList(list, paintAll);
            for (var i = 0; i < zlevelList.length; i++) {
                var z = zlevelList[i];
                var layer = this._layers[z];
                if (!layer.isBuildin && layer.refresh) {
                    layer.refresh();
                }
            }
            return this;
        },
        _paintList: function(list, paintAll) {
            if (paintAll == null) {
                paintAll = false;
            }
            this._updateLayerStatus(list);
            var currentLayer;
            var currentZLevel;
            var ctx;
            var viewWidth = this._width;
            var viewHeight = this._height;
            this.eachBuildinLayer(preProcessLayer);
            var prevElClipPaths = null;
            for (var i = 0, l = list.length; i < l; i++) {
                var el = list[i];
                var elZLevel = this._singleCanvas ? 0 : el.zlevel;
                if (currentZLevel !== elZLevel) {
                    currentZLevel = elZLevel;
                    currentLayer = this.getLayer(currentZLevel);
                    if (!currentLayer.isBuildin) {
                        log("ZLevel " + currentZLevel + " has been used by unkown layer " + currentLayer.id);
                    }
                    ctx = currentLayer.ctx;
                    currentLayer.__unusedCount = 0;
                    if (currentLayer.__dirty || paintAll) {
                        currentLayer.clear();
                    }
                }
                if ((currentLayer.__dirty || paintAll) && !el.invisible && el.style.opacity !== 0 && el.scale[0] && el.scale[1] && !(el.culling && isDisplayableCulled(el, viewWidth, viewHeight))) {
                    var clipPaths = el.__clipPaths;
                    if (isClipPathChanged(clipPaths, prevElClipPaths)) {
                        if (prevElClipPaths) {
                            ctx.restore();
                        }
                        if (clipPaths) {
                            ctx.save();
                            doClip(clipPaths, ctx);
                        }
                        prevElClipPaths = clipPaths;
                    }
                    el.beforeBrush && el.beforeBrush(ctx);
                    el.brush(ctx, false);
                    el.afterBrush && el.afterBrush(ctx);
                }
                el.__dirty = false;
            }
            if (prevElClipPaths) {
                ctx.restore();
            }
            this.eachBuildinLayer(postProcessLayer);
        },
        getLayer: function(zlevel) {
            if (this._singleCanvas) {
                return this._layers[0];
            }
            var layer = this._layers[zlevel];
            if (!layer) {
                layer = new Layer("zr_" + zlevel, this, this.dpr);
                layer.isBuildin = true;
                if (this._layerConfig[zlevel]) {
                    util.merge(layer, this._layerConfig[zlevel], true);
                }
                this.insertLayer(zlevel, layer);
                layer.initContext();
            }
            return layer;
        },
        insertLayer: function(zlevel, layer) {
            var layersMap = this._layers;
            var zlevelList = this._zlevelList;
            var len = zlevelList.length;
            var prevLayer = null;
            var i = -1;
            var domRoot = this._domRoot;
            if (layersMap[zlevel]) {
                log("ZLevel " + zlevel + " has been used already");
                return;
            }
            if (!isLayerValid(layer)) {
                log("Layer of zlevel " + zlevel + " is not valid");
                return;
            }
            if (len > 0 && zlevel > zlevelList[0]) {
                for (i = 0; i < len - 1; i++) {
                    if (zlevelList[i] < zlevel && zlevelList[i + 1] > zlevel) {
                        break;
                    }
                }
                prevLayer = layersMap[zlevelList[i]];
            }
            zlevelList.splice(i + 1, 0, zlevel);
            if (prevLayer) {
                var prevDom = prevLayer.dom;
                if (prevDom.nextSibling) {
                    domRoot.insertBefore(layer.dom, prevDom.nextSibling);
                } else {
                    domRoot.appendChild(layer.dom);
                }
            } else {
                if (domRoot.firstChild) {
                    domRoot.insertBefore(layer.dom, domRoot.firstChild);
                } else {
                    domRoot.appendChild(layer.dom);
                }
            }
            layersMap[zlevel] = layer;
        },
        eachLayer: function(cb, context) {
            var zlevelList = this._zlevelList;
            var z;
            var i;
            for (i = 0; i < zlevelList.length; i++) {
                z = zlevelList[i];
                cb.call(context, this._layers[z], z);
            }
        },
        eachBuildinLayer: function(cb, context) {
            var zlevelList = this._zlevelList;
            var layer;
            var z;
            var i;
            for (i = 0; i < zlevelList.length; i++) {
                z = zlevelList[i];
                layer = this._layers[z];
                if (layer.isBuildin) {
                    cb.call(context, layer, z);
                }
            }
        },
        eachOtherLayer: function(cb, context) {
            var zlevelList = this._zlevelList;
            var layer;
            var z;
            var i;
            for (i = 0; i < zlevelList.length; i++) {
                z = zlevelList[i];
                layer = this._layers[z];
                if (!layer.isBuildin) {
                    cb.call(context, layer, z);
                }
            }
        },
        getLayers: function() {
            return this._layers;
        },
        _updateLayerStatus: function(list) {
            var layers = this._layers;
            var elCounts = {};
            this.eachBuildinLayer(function(layer, z) {
                elCounts[z] = layer.elCount;
                layer.elCount = 0;
            });
            for (var i = 0, l = list.length; i < l; i++) {
                var el = list[i];
                var zlevel = this._singleCanvas ? 0 : el.zlevel;
                var layer = layers[zlevel];
                if (layer) {
                    layer.elCount++;
                    if (layer.__dirty) {
                        continue;
                    }
                    layer.__dirty = el.__dirty;
                }
            }
            this.eachBuildinLayer(function(layer, z) {
                if (elCounts[z] !== layer.elCount) {
                    layer.__dirty = true;
                }
            });
        },
        clear: function() {
            this.eachBuildinLayer(this._clearLayer);
            return this;
        },
        _clearLayer: function(layer) {
            layer.clear();
        },
        configLayer: function(zlevel, config) {
            if (config) {
                var layerConfig = this._layerConfig;
                if (!layerConfig[zlevel]) {
                    layerConfig[zlevel] = config;
                } else {
                    util.merge(layerConfig[zlevel], config, true);
                }
                var layer = this._layers[zlevel];
                if (layer) {
                    util.merge(layer, layerConfig[zlevel], true);
                }
            }
        },
        delLayer: function(zlevel) {
            var layers = this._layers;
            var zlevelList = this._zlevelList;
            var layer = layers[zlevel];
            if (!layer) {
                return;
            }
            layer.dom.parentNode.removeChild(layer.dom);
            delete layers[zlevel];
            zlevelList.splice(util.indexOf(zlevelList, zlevel), 1);
        },
        resize: function(width, height) {
            var domRoot = this._domRoot;
            domRoot.style.display = "none";
            width = width || this._getWidth();
            height = height || this._getHeight();
            domRoot.style.display = "";
            if (this._width != width || height != this._height) {
                domRoot.style.width = width + "px";
                domRoot.style.height = height + "px";
                for (var id in this._layers) {
                    this._layers[id].resize(width, height);
                }
                this.refresh(true);
            }
            this._width = width;
            this._height = height;
            return this;
        },
        clearLayer: function(zlevel) {
            var layer = this._layers[zlevel];
            if (layer) {
                layer.clear();
            }
        },
        dispose: function() {
            this.root.innerHTML = "";
            this.root = this.storage = this._domRoot = this._layers = null;
        },
        getRenderedCanvas: function(opts) {
            opts = opts || {};
            if (this._singleCanvas) {
                return this._layers[0].dom;
            }
            var imageLayer = new Layer("image", this, opts.pixelRatio || this.dpr);
            imageLayer.initContext();
            var ctx = imageLayer.ctx;
            imageLayer.clearColor = opts.backgroundColor;
            imageLayer.clear();
            var displayList = this.storage.getDisplayList(true);
            for (var i = 0; i < displayList.length; i++) {
                var el = displayList[i];
                if (!el.invisible) {
                    el.beforeBrush && el.beforeBrush(ctx);
                    el.brush(ctx, false);
                    el.afterBrush && el.afterBrush(ctx);
                }
            }
            return imageLayer.dom;
        },
        getWidth: function() {
            return this._width;
        },
        getHeight: function() {
            return this._height;
        },
        _getWidth: function() {
            var root = this.root;
            var stl = document.defaultView.getComputedStyle(root);
            return (root.clientWidth || parseInt10(stl.width) || parseInt10(root.style.width)) - (parseInt10(stl.paddingLeft) || 0) - (parseInt10(stl.paddingRight) || 0) | 0;
        },
        _getHeight: function() {
            var root = this.root;
            var stl = document.defaultView.getComputedStyle(root);
            return (root.clientHeight || parseInt10(stl.height) || parseInt10(root.style.height)) - (parseInt10(stl.paddingTop) || 0) - (parseInt10(stl.paddingBottom) || 0) | 0;
        },
        _pathToImage: function(id, path, width, height, dpr) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.clearRect(0, 0, width * dpr, height * dpr);
            var pathTransform = {
                position: path.position,
                rotation: path.rotation,
                scale: path.scale
            };
            path.position = [ 0, 0, 0 ];
            path.rotation = 0;
            path.scale = [ 1, 1 ];
            if (path) {
                path.brush(ctx);
            }
            var ImageShape = require("./graphic/Image");
            var imgShape = new ImageShape({
                id: id,
                style: {
                    x: 0,
                    y: 0,
                    image: canvas
                }
            });
            if (pathTransform.position != null) {
                imgShape.position = path.position = pathTransform.position;
            }
            if (pathTransform.rotation != null) {
                imgShape.rotation = path.rotation = pathTransform.rotation;
            }
            if (pathTransform.scale != null) {
                imgShape.scale = path.scale = pathTransform.scale;
            }
            return imgShape;
        },
        _createPathToImage: function() {
            var me = this;
            return function(id, e, width, height) {
                return me._pathToImage(id, e, width, height, me.dpr);
            };
        }
    };
    return Painter;
});