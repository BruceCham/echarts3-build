define("crm-modules/common/echarts/visual/VisualMapping", [ "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/tool/color", "../util/number" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var zrColor = require("crm-modules/common/echarts/zrender/tool/color");
    var linearMap = require("../util/number").linearMap;
    var each = zrUtil.each;
    var isObject = zrUtil.isObject;
    var CATEGORY_DEFAULT_VISUAL_INDEX = -1;
    var VisualMapping = function(option) {
        var mappingMethod = option.mappingMethod;
        var visualType = option.type;
        this.type = visualType;
        this.mappingMethod = mappingMethod;
        var thisOption = this.option = zrUtil.clone(option);
        this._normalizeData = normalizers[mappingMethod];
        this._getSpecifiedVisual = zrUtil.bind(specifiedVisualGetters[mappingMethod], this, visualType);
        zrUtil.extend(this, visualHandlers[visualType]);
        if (mappingMethod === "piecewise") {
            preprocessForPiecewise(thisOption);
        }
        if (mappingMethod === "category") {
            preprocessForCategory(thisOption);
        }
    };
    VisualMapping.prototype = {
        constructor: VisualMapping,
        applyVisual: null,
        isValueActive: null,
        mapValueToVisual: null,
        getNormalizer: function() {
            return zrUtil.bind(this._normalizeData, this);
        }
    };
    var visualHandlers = VisualMapping.visualHandlers = {
        color: {
            applyVisual: defaultApplyColor,
            getColorMapper: function() {
                var visual = isCategory(this) ? this.option.visual : zrUtil.map(this.option.visual, zrColor.parse);
                return zrUtil.bind(isCategory(this) ? function(value, isNormalized) {
                    !isNormalized && (value = this._normalizeData(value));
                    return getVisualForCategory(this, visual, value);
                } : function(value, isNormalized, out) {
                    var returnRGBArray = !!out;
                    !isNormalized && (value = this._normalizeData(value));
                    out = zrColor.fastMapToColor(value, visual, out);
                    return returnRGBArray ? out : zrUtil.stringify(out, "rgba");
                }, this);
            },
            mapValueToVisual: function(value) {
                var visual = this.option.visual;
                if (zrUtil.isArray(value)) {
                    value = [ this._normalizeData(value[0]), this._normalizeData(value[1]) ];
                    return zrColor.mapIntervalToColor(value, visual);
                } else {
                    var normalized = this._normalizeData(value);
                    var result = this._getSpecifiedVisual(value);
                    if (result == null) {
                        result = isCategory(this) ? getVisualForCategory(this, visual, normalized) : zrColor.mapToColor(normalized, visual);
                    }
                    return result;
                }
            }
        },
        colorHue: makePartialColorVisualHandler(function(color, value) {
            return zrColor.modifyHSL(color, value);
        }),
        colorSaturation: makePartialColorVisualHandler(function(color, value) {
            return zrColor.modifyHSL(color, null, value);
        }),
        colorLightness: makePartialColorVisualHandler(function(color, value) {
            return zrColor.modifyHSL(color, null, null, value);
        }),
        colorAlpha: makePartialColorVisualHandler(function(color, value) {
            return zrColor.modifyAlpha(color, value);
        }),
        symbol: {
            applyVisual: function(value, getter, setter) {
                var symbolCfg = this.mapValueToVisual(value);
                if (zrUtil.isString(symbolCfg)) {
                    setter("symbol", symbolCfg);
                } else if (isObject(symbolCfg)) {
                    for (var name in symbolCfg) {
                        if (symbolCfg.hasOwnProperty(name)) {
                            setter(name, symbolCfg[name]);
                        }
                    }
                }
            },
            mapValueToVisual: function(value) {
                var normalized = this._normalizeData(value);
                var result = this._getSpecifiedVisual(value);
                var visual = this.option.visual;
                if (result == null) {
                    result = isCategory(this) ? getVisualForCategory(this, visual, normalized) : arrayGetByNormalizedValue(visual, normalized) || {};
                }
                return result;
            }
        },
        symbolSize: {
            applyVisual: function(value, getter, setter) {
                setter("symbolSize", this.mapValueToVisual(value));
            },
            mapValueToVisual: function(value) {
                var normalized = this._normalizeData(value);
                var result = this._getSpecifiedVisual(value);
                var visual = this.option.visual;
                if (result == null) {
                    result = isCategory(this) ? getVisualForCategory(this, visual, normalized) : linearMap(normalized, [ 0, 1 ], visual, true);
                }
                return result;
            }
        }
    };
    function preprocessForPiecewise(thisOption) {
        var pieceList = thisOption.pieceList;
        thisOption.hasSpecialVisual = false;
        zrUtil.each(pieceList, function(piece, index) {
            piece.originIndex = index;
            if (piece.visual) {
                thisOption.hasSpecialVisual = true;
            }
        });
    }
    function preprocessForCategory(thisOption) {
        var categories = thisOption.categories;
        var visual = thisOption.visual;
        var isVisualArray = zrUtil.isArray(visual);
        if (!categories) {
            if (!isVisualArray) {
                throw new Error();
            } else {
                return;
            }
        }
        var categoryMap = thisOption.categoryMap = {};
        each(categories, function(cate, index) {
            categoryMap[cate] = index;
        });
        if (!isVisualArray) {
            var visualArr = [];
            if (zrUtil.isObject(visual)) {
                each(visual, function(v, cate) {
                    var index = categoryMap[cate];
                    visualArr[index != null ? index : CATEGORY_DEFAULT_VISUAL_INDEX] = v;
                });
            } else {
                visualArr[CATEGORY_DEFAULT_VISUAL_INDEX] = visual;
            }
            visual = thisOption.visual = visualArr;
        }
        for (var i = categories.length - 1; i >= 0; i--) {
            if (visual[i] == null) {
                delete categoryMap[categories[i]];
                categories.pop();
            }
        }
    }
    function makePartialColorVisualHandler(applyValue) {
        return {
            applyVisual: function(value, getter, setter) {
                var color = getter("color");
                var isArrayValue = zrUtil.isArray(value);
                value = isArrayValue ? [ this.mapValueToVisual(value[0]), this.mapValueToVisual(value[1]) ] : this.mapValueToVisual(value);
                if (zrUtil.isArray(color)) {
                    for (var i = 0, len = color.length; i < len; i++) {
                        color[i].color = applyValue(color[i].color, isArrayValue ? value[i] : value);
                    }
                } else {
                    setter("color", applyValue(color, value));
                }
            },
            mapValueToVisual: function(value) {
                var normalized = this._normalizeData(value);
                var result = this._getSpecifiedVisual(value);
                var visual = this.option.visual;
                if (result == null) {
                    result = isCategory(this) ? getVisualForCategory(this, visual, normalized) : linearMap(normalized, [ 0, 1 ], visual, true);
                }
                return result;
            }
        };
    }
    function arrayGetByNormalizedValue(arr, normalized) {
        return arr[Math.round(linearMap(normalized, [ 0, 1 ], [ 0, arr.length - 1 ], true))];
    }
    function defaultApplyColor(value, getter, setter) {
        setter("color", this.mapValueToVisual(value));
    }
    function getVisualForCategory(me, visual, normalized) {
        return visual[me.option.loop && normalized !== CATEGORY_DEFAULT_VISUAL_INDEX ? normalized % visual.length : normalized];
    }
    function isCategory(me) {
        return me.option.mappingMethod === "category";
    }
    var normalizers = {
        linear: function(value) {
            return linearMap(value, this.option.dataExtent, [ 0, 1 ], true);
        },
        piecewise: function(value) {
            var pieceList = this.option.pieceList;
            var pieceIndex = VisualMapping.findPieceIndex(value, pieceList);
            if (pieceIndex != null) {
                return linearMap(pieceIndex, [ 0, pieceList.length - 1 ], [ 0, 1 ], true);
            }
        },
        category: function(value) {
            var index = this.option.categories ? this.option.categoryMap[value] : value;
            return index == null ? CATEGORY_DEFAULT_VISUAL_INDEX : index;
        }
    };
    var specifiedVisualGetters = {
        linear: zrUtil.noop,
        piecewise: function(visualType, value) {
            var thisOption = this.option;
            var pieceList = thisOption.pieceList;
            if (thisOption.hasSpecialVisual) {
                var pieceIndex = VisualMapping.findPieceIndex(value, pieceList);
                var piece = pieceList[pieceIndex];
                if (piece && piece.visual) {
                    return piece.visual[visualType];
                }
            }
        },
        category: zrUtil.noop
    };
    VisualMapping.addVisualHandler = function(name, handler) {
        visualHandlers[name] = handler;
    };
    VisualMapping.isValidType = function(visualType) {
        return visualHandlers.hasOwnProperty(visualType);
    };
    VisualMapping.eachVisual = function(visual, callback, context) {
        if (zrUtil.isObject(visual)) {
            zrUtil.each(visual, callback, context);
        } else {
            callback.call(context, visual);
        }
    };
    VisualMapping.mapVisual = function(visual, callback, context) {
        var isPrimary;
        var newVisual = zrUtil.isArray(visual) ? [] : zrUtil.isObject(visual) ? {} : (isPrimary = true, 
        null);
        VisualMapping.eachVisual(visual, function(v, key) {
            var newVal = callback.call(context, v, key);
            isPrimary ? newVisual = newVal : newVisual[key] = newVal;
        });
        return newVisual;
    };
    VisualMapping.isInVisualCluster = function(visualType, visualCluster) {
        return visualCluster === "color" ? !!(visualType && visualType.indexOf(visualCluster) === 0) : visualType === visualCluster;
    };
    VisualMapping.retrieveVisuals = function(obj) {
        var ret = {};
        var hasVisual;
        obj && each(visualHandlers, function(h, visualType) {
            if (obj.hasOwnProperty(visualType)) {
                ret[visualType] = obj[visualType];
                hasVisual = true;
            }
        });
        return hasVisual ? ret : null;
    };
    VisualMapping.prepareVisualTypes = function(visualTypes) {
        if (isObject(visualTypes)) {
            var types = [];
            each(visualTypes, function(item, type) {
                types.push(type);
            });
            visualTypes = types;
        } else if (zrUtil.isArray(visualTypes)) {
            visualTypes = visualTypes.slice();
        } else {
            return [];
        }
        visualTypes.sort(function(type1, type2) {
            return type2 === "color" && type1 !== "color" && type1.indexOf("color") === 0 ? 1 : -1;
        });
        return visualTypes;
    };
    VisualMapping.findPieceIndex = function(value, pieceList) {
        for (var i = 0, len = pieceList.length; i < len; i++) {
            var piece = pieceList[i];
            if (piece.value != null && piece.value === value) {
                return i;
            }
        }
        for (var i = 0, len = pieceList.length; i < len; i++) {
            var piece = pieceList[i];
            var interval = piece.interval;
            if (interval) {
                if (interval[0] === -Infinity) {
                    if (value < interval[1]) {
                        return i;
                    }
                } else if (interval[1] === Infinity) {
                    if (interval[0] < value) {
                        return i;
                    }
                } else if (piece.interval[0] <= value && value <= piece.interval[1]) {
                    return i;
                }
            }
        }
    };
    return VisualMapping;
});