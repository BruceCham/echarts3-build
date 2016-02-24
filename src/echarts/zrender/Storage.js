define("crm-modules/common/echarts/zrender/Storage", [ "./core/util", "./container/Group" ], function(require, exports, module) {
    "use strict";
    var util = require("./core/util");
    var Group = require("./container/Group");
    function shapeCompareFunc(a, b) {
        if (a.zlevel === b.zlevel) {
            if (a.z === b.z) {
                if (a.z2 === b.z2) {
                    return a.__renderidx - b.__renderidx;
                }
                return a.z2 - b.z2;
            }
            return a.z - b.z;
        }
        return a.zlevel - b.zlevel;
    }
    var Storage = function() {
        this._elements = {};
        this._roots = [];
        this._displayList = [];
        this._displayListLen = 0;
    };
    Storage.prototype = {
        constructor: Storage,
        getDisplayList: function(update) {
            if (update) {
                this.updateDisplayList();
            }
            return this._displayList;
        },
        updateDisplayList: function() {
            this._displayListLen = 0;
            var roots = this._roots;
            var displayList = this._displayList;
            for (var i = 0, len = roots.length; i < len; i++) {
                var root = roots[i];
                this._updateAndAddDisplayable(root);
            }
            displayList.length = this._displayListLen;
            for (var i = 0, len = displayList.length; i < len; i++) {
                displayList[i].__renderidx = i;
            }
            displayList.sort(shapeCompareFunc);
        },
        _updateAndAddDisplayable: function(el, clipPaths) {
            if (el.ignore) {
                return;
            }
            el.beforeUpdate();
            el.update();
            el.afterUpdate();
            var clipPath = el.clipPath;
            if (clipPath) {
                clipPath.parent = el;
                clipPath.updateTransform();
                if (clipPaths) {
                    clipPaths = clipPaths.slice();
                    clipPaths.push(clipPath);
                } else {
                    clipPaths = [ clipPath ];
                }
            }
            if (el.type == "group") {
                var children = el._children;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    child.__dirty = el.__dirty || child.__dirty;
                    this._updateAndAddDisplayable(child, clipPaths);
                }
                el.__dirty = false;
            } else {
                el.__clipPaths = clipPaths;
                this._displayList[this._displayListLen++] = el;
            }
        },
        addRoot: function(el) {
            if (this._elements[el.id]) {
                return;
            }
            if (el instanceof Group) {
                el.addChildrenToStorage(this);
            }
            this.addToMap(el);
            this._roots.push(el);
        },
        delRoot: function(elId) {
            if (elId == null) {
                for (var i = 0; i < this._roots.length; i++) {
                    var root = this._roots[i];
                    if (root instanceof Group) {
                        root.delChildrenFromStorage(this);
                    }
                }
                this._elements = {};
                this._roots = [];
                this._displayList = [];
                this._displayListLen = 0;
                return;
            }
            if (elId instanceof Array) {
                for (var i = 0, l = elId.length; i < l; i++) {
                    this.delRoot(elId[i]);
                }
                return;
            }
            var el;
            if (typeof elId == "string") {
                el = this._elements[elId];
            } else {
                el = elId;
            }
            var idx = util.indexOf(this._roots, el);
            if (idx >= 0) {
                this.delFromMap(el.id);
                this._roots.splice(idx, 1);
                if (el instanceof Group) {
                    el.delChildrenFromStorage(this);
                }
            }
        },
        addToMap: function(el) {
            if (el instanceof Group) {
                el.__storage = this;
            }
            el.dirty();
            this._elements[el.id] = el;
            return this;
        },
        get: function(elId) {
            return this._elements[elId];
        },
        delFromMap: function(elId) {
            var elements = this._elements;
            var el = elements[elId];
            if (el) {
                delete elements[elId];
                if (el instanceof Group) {
                    el.__storage = null;
                }
            }
            return this;
        },
        dispose: function() {
            this._elements = this._renderList = this._roots = null;
        }
    };
    return Storage;
});