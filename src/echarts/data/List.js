define("crm-modules/common/echarts/data/List", [ "../model/Model", "./DataDiffer", "crm-modules/common/echarts/zrender/core/util", "../util/model" ], function(require, exports, module) {
    var UNDEFINED = "undefined";
    var globalObj = typeof window === "undefined" ? global : window;
    var Float64Array = typeof globalObj.Float64Array === UNDEFINED ? Array : globalObj.Float64Array;
    var Int32Array = typeof globalObj.Int32Array === UNDEFINED ? Array : globalObj.Int32Array;
    var dataCtors = {
        "float": Float64Array,
        "int": Int32Array,
        ordinal: Array,
        number: Array,
        time: Array
    };
    var Model = require("../model/Model");
    var DataDiffer = require("./DataDiffer");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var modelUtil = require("../util/model");
    var isObject = zrUtil.isObject;
    var IMMUTABLE_PROPERTIES = [ "stackedOn", "_nameList", "_idList", "_rawData" ];
    var transferImmuProperties = function(a, b, wrappedMethod) {
        zrUtil.each(IMMUTABLE_PROPERTIES.concat(wrappedMethod || []), function(propName) {
            if (b.hasOwnProperty(propName)) {
                a[propName] = b[propName];
            }
        });
    };
    var List = function(dimensions, hostModel) {
        dimensions = dimensions || [ "x", "y" ];
        var dimensionInfos = {};
        var dimensionNames = [];
        for (var i = 0; i < dimensions.length; i++) {
            var dimensionName;
            var dimensionInfo = {};
            if (typeof dimensions[i] === "string") {
                dimensionName = dimensions[i];
                dimensionInfo = {
                    name: dimensionName,
                    stackable: false,
                    type: "number"
                };
            } else {
                dimensionInfo = dimensions[i];
                dimensionName = dimensionInfo.name;
                dimensionInfo.type = dimensionInfo.type || "number";
            }
            dimensionNames.push(dimensionName);
            dimensionInfos[dimensionName] = dimensionInfo;
        }
        this.dimensions = dimensionNames;
        this._dimensionInfos = dimensionInfos;
        this.hostModel = hostModel;
        this.indices = [];
        this._storage = {};
        this._nameList = [];
        this._idList = [];
        this._optionModels = [];
        this.stackedOn = null;
        this._visual = {};
        this._layout = {};
        this._itemVisuals = [];
        this._itemLayouts = [];
        this._graphicEls = [];
        this._rawData;
    };
    var listProto = List.prototype;
    listProto.type = "list";
    listProto.getDimension = function(dim) {
        if (!isNaN(dim)) {
            dim = this.dimensions[dim] || dim;
        }
        return dim;
    };
    listProto.getDimensionInfo = function(dim) {
        return this._dimensionInfos[this.getDimension(dim)];
    };
    listProto.initData = function(data, nameList, dimValueGetter) {
        data = data || [];
        this._rawData = data;
        var storage = this._storage = {};
        var indices = this.indices = [];
        var dimensions = this.dimensions;
        var size = data.length;
        var dimensionInfoMap = this._dimensionInfos;
        var idList = [];
        var nameRepeatCount = {};
        nameList = nameList || [];
        for (var i = 0; i < dimensions.length; i++) {
            var dimInfo = dimensionInfoMap[dimensions[i]];
            var DataCtor = dataCtors[dimInfo.type];
            storage[dimensions[i]] = new DataCtor(size);
        }
        dimValueGetter = dimValueGetter || function(dataItem, dimName, dataIndex, dimIndex) {
            var value = modelUtil.getDataItemValue(dataItem);
            return modelUtil.converDataValue(zrUtil.isArray(value) ? value[dimIndex] : value, dimensionInfoMap[dimName]);
        };
        for (var idx = 0; idx < data.length; idx++) {
            var dataItem = data[idx];
            for (var k = 0; k < dimensions.length; k++) {
                var dim = dimensions[k];
                var dimStorage = storage[dim];
                dimStorage[idx] = dimValueGetter(dataItem, dim, idx, k);
            }
            indices.push(idx);
        }
        for (var i = 0; i < data.length; i++) {
            var id = "";
            if (!nameList[i]) {
                nameList[i] = data[i].name;
                id = data[i].id;
            }
            var name = nameList[i] || "";
            if (!id && name) {
                nameRepeatCount[name] = nameRepeatCount[name] || 0;
                id = name;
                if (nameRepeatCount[name] > 0) {
                    id += "__ec__" + nameRepeatCount[name];
                }
                nameRepeatCount[name]++;
            }
            id && (idList[i] = id);
        }
        this._nameList = nameList;
        this._idList = idList;
    };
    listProto.count = function() {
        return this.indices.length;
    };
    listProto.get = function(dim, idx, stack) {
        var storage = this._storage;
        var dataIndex = this.indices[idx];
        var value = storage[dim] && storage[dim][dataIndex];
        if (stack) {
            var dimensionInfo = this._dimensionInfos[dim];
            if (dimensionInfo && dimensionInfo.stackable) {
                var stackedOn = this.stackedOn;
                while (stackedOn) {
                    var stackedValue = stackedOn.get(dim, idx);
                    if (value >= 0 && stackedValue > 0 || value <= 0 && stackedValue < 0) {
                        value += stackedValue;
                    }
                    stackedOn = stackedOn.stackedOn;
                }
            }
        }
        return value;
    };
    listProto.getValues = function(dimensions, idx, stack) {
        var values = [];
        if (!zrUtil.isArray(dimensions)) {
            stack = idx;
            idx = dimensions;
            dimensions = this.dimensions;
        }
        for (var i = 0, len = dimensions.length; i < len; i++) {
            values.push(this.get(dimensions[i], idx, stack));
        }
        return values;
    };
    listProto.hasValue = function(idx) {
        var dimensions = this.dimensions;
        var dimensionInfos = this._dimensionInfos;
        for (var i = 0, len = dimensions.length; i < len; i++) {
            if (dimensionInfos[dimensions[i]].type !== "ordinal" && isNaN(this.get(dimensions[i], idx))) {
                return false;
            }
        }
        return true;
    };
    listProto.getDataExtent = function(dim, stack) {
        var dimData = this._storage[dim];
        var dimInfo = this.getDimensionInfo(dim);
        stack = dimInfo && dimInfo.stackable && stack;
        var dimExtent = (this._extent || (this._extent = {}))[dim + !!stack];
        var value;
        if (dimExtent) {
            return dimExtent;
        }
        if (dimData) {
            var min = Infinity;
            var max = -Infinity;
            for (var i = 0, len = this.count(); i < len; i++) {
                value = this.get(dim, i, stack);
                value < min && (min = value);
                value > max && (max = value);
            }
            return this._extent[dim + stack] = [ min, max ];
        } else {
            return [ Infinity, -Infinity ];
        }
    };
    listProto.getSum = function(dim, stack) {
        var dimData = this._storage[dim];
        var sum = 0;
        if (dimData) {
            for (var i = 0, len = this.count(); i < len; i++) {
                var value = this.get(dim, i, stack);
                if (!isNaN(value)) {
                    sum += value;
                }
            }
        }
        return sum;
    };
    listProto.indexOf = function(dim, value) {
        var storage = this._storage;
        var dimData = storage[dim];
        var indices = this.indices;
        if (dimData) {
            for (var i = 0, len = indices.length; i < len; i++) {
                var rawIndex = indices[i];
                if (dimData[rawIndex] === value) {
                    return i;
                }
            }
        }
        return -1;
    };
    listProto.indexOfName = function(name) {
        var indices = this.indices;
        var nameList = this._nameList;
        for (var i = 0, len = indices.length; i < len; i++) {
            var rawIndex = indices[i];
            if (nameList[rawIndex] === name) {
                return i;
            }
        }
        return -1;
    };
    listProto.indexOfNearest = function(dim, value, stack) {
        if (!zrUtil.isArray(dim)) {
            dim = dim ? [ dim ] : [];
        }
        var storage = this._storage;
        var dimData = storage[dim];
        if (dimData) {
            var minDist = Number.MAX_VALUE;
            var nearestIdx = -1;
            for (var j = 0, lenj = dim.length; j < lenj; j++) {
                for (var i = 0, len = this.count(); i < len; i++) {
                    var dist = Math.abs(this.get(dim[j], i, stack) - value);
                    if (dist <= minDist) {
                        minDist = dist;
                        nearestIdx = i;
                    }
                }
            }
            return nearestIdx;
        }
        return -1;
    };
    listProto.getRawIndex = function(idx) {
        var rawIdx = this.indices[idx];
        return rawIdx == null ? -1 : rawIdx;
    };
    listProto.getName = function(idx) {
        return this._nameList[this.indices[idx]] || "";
    };
    listProto.getId = function(idx) {
        return this._idList[this.indices[idx]] || this.getRawIndex(idx) + "";
    };
    function normalizeDimensions(dimensions) {
        if (!zrUtil.isArray(dimensions)) {
            dimensions = [ dimensions ];
        }
        return dimensions;
    }
    listProto.each = function(dimensions, cb, stack, context) {
        if (typeof dimensions === "function") {
            context = stack;
            stack = cb;
            cb = dimensions;
            dimensions = [];
        }
        dimensions = zrUtil.map(normalizeDimensions(dimensions), this.getDimension, this);
        var value = [];
        var dimSize = dimensions.length;
        var indices = this.indices;
        context = context || this;
        for (var i = 0; i < indices.length; i++) {
            if (dimSize === 0) {
                cb.call(context, i);
            } else if (dimSize === 1) {
                cb.call(context, this.get(dimensions[0], i, stack), i);
            } else {
                for (var k = 0; k < dimSize; k++) {
                    value[k] = this.get(dimensions[k], i, stack);
                }
                value[k] = i;
                cb.apply(context, value);
            }
        }
    };
    listProto.filterSelf = function(dimensions, cb, stack, context) {
        if (typeof dimensions === "function") {
            context = stack;
            stack = cb;
            cb = dimensions;
            dimensions = [];
        }
        dimensions = zrUtil.map(normalizeDimensions(dimensions), this.getDimension, this);
        var newIndices = [];
        var value = [];
        var dimSize = dimensions.length;
        var indices = this.indices;
        context = context || this;
        for (var i = 0; i < indices.length; i++) {
            var keep;
            if (dimSize === 1) {
                keep = cb.call(context, this.get(dimensions[0], i, stack), i);
            } else {
                for (var k = 0; k < dimSize; k++) {
                    value[k] = this.get(dimensions[k], i, stack);
                }
                value[k] = i;
                keep = cb.apply(context, value);
            }
            if (keep) {
                newIndices.push(indices[i]);
            }
        }
        this.indices = newIndices;
        this._extent = {};
        return this;
    };
    listProto.mapArray = function(dimensions, cb, stack, context) {
        if (typeof dimensions === "function") {
            context = stack;
            stack = cb;
            cb = dimensions;
            dimensions = [];
        }
        var result = [];
        this.each(dimensions, function() {
            result.push(cb && cb.apply(this, arguments));
        }, stack, context);
        return result;
    };
    listProto.map = function(dimensions, cb, stack, context) {
        dimensions = zrUtil.map(normalizeDimensions(dimensions), this.getDimension, this);
        var allDimensions = this.dimensions;
        var list = new List(zrUtil.map(allDimensions, this.getDimensionInfo, this), this.hostModel);
        var indices = list.indices = this.indices;
        transferImmuProperties(list, this, this._wrappedMethods);
        var storage = list._storage = {};
        var thisStorage = this._storage;
        for (var i = 0; i < allDimensions.length; i++) {
            var dim = allDimensions[i];
            var dimStore = thisStorage[dim];
            if (zrUtil.indexOf(dimensions, dim) >= 0) {
                storage[dim] = new dimStore.constructor(thisStorage[dim].length);
            } else {
                storage[dim] = thisStorage[dim];
            }
        }
        var tmpRetValue = [];
        this.each(dimensions, function() {
            var idx = arguments[arguments.length - 1];
            var retValue = cb && cb.apply(this, arguments);
            if (retValue != null) {
                if (typeof retValue === "number") {
                    tmpRetValue[0] = retValue;
                    retValue = tmpRetValue;
                }
                for (var i = 0; i < retValue.length; i++) {
                    var dim = dimensions[i];
                    var dimStore = storage[dim];
                    var rawIdx = indices[idx];
                    if (dimStore) {
                        dimStore[rawIdx] = retValue[i];
                    }
                }
            }
        });
        return list;
    };
    listProto.getItemModel = function(idx) {
        var hostModel = this.hostModel;
        idx = this.indices[idx];
        return new Model(this._rawData[idx], hostModel, hostModel.ecModel);
    };
    listProto.diff = function(otherList) {
        var idList = this._idList;
        var otherIdList = otherList && otherList._idList;
        return new DataDiffer(otherList ? otherList.indices : [], this.indices, function(idx) {
            return otherIdList[idx] || idx + "";
        }, function(idx) {
            return idList[idx] || idx + "";
        });
    };
    listProto.getVisual = function(key) {
        var visual = this._visual;
        return visual && visual[key];
    };
    listProto.setVisual = function(key, val) {
        if (isObject(key)) {
            for (var name in key) {
                if (key.hasOwnProperty(name)) {
                    this.setVisual(name, key[name]);
                }
            }
            return;
        }
        this._visual = this._visual || {};
        this._visual[key] = val;
    };
    listProto.setLayout = function(key, val) {
        this._layout[key] = val;
    };
    listProto.getLayout = function(key) {
        return this._layout[key];
    };
    listProto.getItemLayout = function(idx) {
        return this._itemLayouts[idx];
    }, listProto.setItemLayout = function(idx, layout, merge) {
        this._itemLayouts[idx] = merge ? zrUtil.extend(this._itemLayouts[idx] || {}, layout) : layout;
    }, listProto.getItemVisual = function(idx, key, ignoreParent) {
        var itemVisual = this._itemVisuals[idx];
        var val = itemVisual && itemVisual[key];
        if (val == null && !ignoreParent) {
            return this.getVisual(key);
        }
        return val;
    }, listProto.setItemVisual = function(idx, key, value) {
        var itemVisual = this._itemVisuals[idx] || {};
        this._itemVisuals[idx] = itemVisual;
        if (isObject(key)) {
            for (var name in key) {
                if (key.hasOwnProperty(name)) {
                    itemVisual[name] = key[name];
                }
            }
            return;
        }
        itemVisual[key] = value;
    };
    var setItemDataAndSeriesIndex = function(child) {
        child.seriesIndex = this.seriesIndex;
        child.dataIndex = this.dataIndex;
    };
    listProto.setItemGraphicEl = function(idx, el) {
        var hostModel = this.hostModel;
        if (el) {
            el.dataIndex = idx;
            el.seriesIndex = hostModel && hostModel.seriesIndex;
            if (el.type === "group") {
                el.traverse(setItemDataAndSeriesIndex, el);
            }
        }
        this._graphicEls[idx] = el;
    };
    listProto.getItemGraphicEl = function(idx) {
        return this._graphicEls[idx];
    };
    listProto.eachItemGraphicEl = function(cb, context) {
        zrUtil.each(this._graphicEls, function(el, idx) {
            if (el) {
                cb && cb.call(context, el, idx);
            }
        });
    };
    listProto.cloneShallow = function() {
        var dimensionInfoList = zrUtil.map(this.dimensions, this.getDimensionInfo, this);
        var list = new List(dimensionInfoList, this.hostModel);
        list._storage = this._storage;
        transferImmuProperties(list, this, this._wrappedMethods);
        list.indices = this.indices.slice();
        return list;
    };
    listProto.wrapMethod = function(methodName, injectFunction) {
        var originalMethod = this[methodName];
        if (typeof originalMethod !== "function") {
            return;
        }
        this._wrappedMethods = this._wrappedMethods || [];
        this._wrappedMethods.push(methodName);
        this[methodName] = function() {
            var res = originalMethod.apply(this, arguments);
            return injectFunction.call(this, res);
        };
    };
    return List;
});