define("crm-modules/common/echarts/data/DataDiffer", [], function(require, exports, module) {
    "use strict";
    function defaultKeyGetter(item) {
        return item;
    }
    function DataDiffer(oldArr, newArr, oldKeyGetter, newKeyGetter) {
        this._old = oldArr;
        this._new = newArr;
        this._oldKeyGetter = oldKeyGetter || defaultKeyGetter;
        this._newKeyGetter = newKeyGetter || defaultKeyGetter;
    }
    DataDiffer.prototype = {
        constructor: DataDiffer,
        add: function(func) {
            this._add = func;
            return this;
        },
        update: function(func) {
            this._update = func;
            return this;
        },
        remove: function(func) {
            this._remove = func;
            return this;
        },
        execute: function() {
            var oldArr = this._old;
            var newArr = this._new;
            var oldKeyGetter = this._oldKeyGetter;
            var newKeyGetter = this._newKeyGetter;
            var oldDataIndexMap = {};
            var newDataIndexMap = {};
            var i;
            initIndexMap(oldArr, oldDataIndexMap, oldKeyGetter);
            initIndexMap(newArr, newDataIndexMap, newKeyGetter);
            for (i = 0; i < oldArr.length; i++) {
                var key = oldKeyGetter(oldArr[i]);
                var idx = newDataIndexMap[key];
                if (idx != null) {
                    var len = idx.length;
                    if (len) {
                        len === 1 && (newDataIndexMap[key] = null);
                        idx = idx.unshift();
                    } else {
                        newDataIndexMap[key] = null;
                    }
                    this._update && this._update(idx, i);
                } else {
                    this._remove && this._remove(i);
                }
            }
            for (var key in newDataIndexMap) {
                if (newDataIndexMap.hasOwnProperty(key)) {
                    var idx = newDataIndexMap[key];
                    if (idx == null) {
                        continue;
                    }
                    if (!idx.length) {
                        this._add && this._add(idx);
                    } else {
                        for (var i = 0, len = idx.length; i < len; i++) {
                            this._add && this._add(idx[i]);
                        }
                    }
                }
            }
        }
    };
    function initIndexMap(arr, map, keyGetter) {
        for (var i = 0; i < arr.length; i++) {
            var key = keyGetter(arr[i]);
            var existence = map[key];
            if (existence == null) {
                map[key] = i;
            } else {
                if (!existence.length) {
                    map[key] = existence = [ existence ];
                }
                existence.push(i);
            }
        }
    }
    return DataDiffer;
});