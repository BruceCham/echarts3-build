define("crm-modules/common/echarts/util/model", [ "./format", "./number", "crm-modules/common/echarts/zrender/core/util", "../model/Model" ], function(require, exports, module) {
    var formatUtil = require("./format");
    var nubmerUtil = require("./number");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Model = require("../model/Model");
    var AXIS_DIMS = [ "x", "y", "z", "radius", "angle" ];
    var modelUtil = {};
    modelUtil.createNameEach = function(names, attrs) {
        names = names.slice();
        var capitalNames = zrUtil.map(names, modelUtil.capitalFirst);
        attrs = (attrs || []).slice();
        var capitalAttrs = zrUtil.map(attrs, modelUtil.capitalFirst);
        return function(callback, context) {
            zrUtil.each(names, function(name, index) {
                var nameObj = {
                    name: name,
                    capital: capitalNames[index]
                };
                for (var j = 0; j < attrs.length; j++) {
                    nameObj[attrs[j]] = name + capitalAttrs[j];
                }
                callback.call(context, nameObj);
            });
        };
    };
    modelUtil.capitalFirst = function(str) {
        return str ? str.charAt(0).toUpperCase() + str.substr(1) : str;
    };
    modelUtil.eachAxisDim = modelUtil.createNameEach(AXIS_DIMS, [ "axisIndex", "axis", "index" ]);
    modelUtil.normalizeToArray = function(value) {
        return zrUtil.isArray(value) ? value : value == null ? [] : [ value ];
    };
    modelUtil.createLinkedNodesFinder = function(forEachNode, forEachEdgeType, edgeIdGetter) {
        return function(sourceNode) {
            var result = {
                nodes: [],
                records: {}
            };
            forEachEdgeType(function(edgeType) {
                result.records[edgeType.name] = {};
            });
            if (!sourceNode) {
                return result;
            }
            absorb(sourceNode, result);
            var existsLink;
            do {
                existsLink = false;
                forEachNode(processSingleNode);
            } while (existsLink);
            function processSingleNode(node) {
                if (!isNodeAbsorded(node, result) && isLinked(node, result)) {
                    absorb(node, result);
                    existsLink = true;
                }
            }
            return result;
        };
        function isNodeAbsorded(node, result) {
            return zrUtil.indexOf(result.nodes, node) >= 0;
        }
        function isLinked(node, result) {
            var hasLink = false;
            forEachEdgeType(function(edgeType) {
                zrUtil.each(edgeIdGetter(node, edgeType) || [], function(edgeId) {
                    result.records[edgeType.name][edgeId] && (hasLink = true);
                });
            });
            return hasLink;
        }
        function absorb(node, result) {
            result.nodes.push(node);
            forEachEdgeType(function(edgeType) {
                zrUtil.each(edgeIdGetter(node, edgeType) || [], function(edgeId) {
                    result.records[edgeType.name][edgeId] = true;
                });
            });
        }
    };
    modelUtil.defaultEmphasis = function(opt, subOpts) {
        if (opt) {
            var emphasisOpt = opt.emphasis = opt.emphasis || {};
            var normalOpt = opt.normal = opt.normal || {};
            zrUtil.each(subOpts, function(subOptName) {
                var val = zrUtil.retrieve(emphasisOpt[subOptName], normalOpt[subOptName]);
                if (val != null) {
                    emphasisOpt[subOptName] = val;
                }
            });
        }
    };
    modelUtil.createDataFormatModel = function(opt, data, rawData) {
        var model = new Model();
        zrUtil.mixin(model, modelUtil.dataFormatMixin);
        model.seriesIndex = opt.seriesIndex;
        model.name = opt.name || "";
        model.getData = function() {
            return data;
        };
        model.getRawDataArray = function() {
            return rawData;
        };
        return model;
    };
    modelUtil.getDataItemValue = function(dataItem) {
        return dataItem && (dataItem.value == null ? dataItem : dataItem.value);
    };
    modelUtil.converDataValue = function(value, dimInfo) {
        var dimType = dimInfo && dimInfo.type;
        if (dimType === "ordinal") {
            return value;
        }
        if (dimType === "time" && !isFinite(value) && value != null && value !== "-") {
            value = +nubmerUtil.parseDate(value);
        }
        return value == null || value === "" ? NaN : +value;
    };
    modelUtil.dataFormatMixin = {
        getDataParams: function(dataIndex) {
            var data = this.getData();
            var seriesIndex = this.seriesIndex;
            var seriesName = this.name;
            var rawValue = this.getRawValue(dataIndex);
            var rawDataIndex = data.getRawIndex(dataIndex);
            var name = data.getName(dataIndex, true);
            var rawDataArray = this.getRawDataArray();
            var itemOpt = rawDataArray && rawDataArray[rawDataIndex];
            return {
                seriesIndex: seriesIndex,
                seriesName: seriesName,
                name: name,
                dataIndex: rawDataIndex,
                data: itemOpt,
                value: rawValue,
                $vars: [ "seriesName", "name", "value" ]
            };
        },
        getFormattedLabel: function(dataIndex, status, formatter) {
            status = status || "normal";
            var data = this.getData();
            var itemModel = data.getItemModel(dataIndex);
            var params = this.getDataParams(dataIndex);
            if (!formatter) {
                formatter = itemModel.get([ "label", status, "formatter" ]);
            }
            if (typeof formatter === "function") {
                params.status = status;
                return formatter(params);
            } else if (typeof formatter === "string") {
                return formatUtil.formatTpl(formatter, params);
            }
        },
        getRawValue: function(idx) {
            var itemModel = this.getData().getItemModel(idx);
            if (itemModel && itemModel.option != null) {
                var dataItem = itemModel.option;
                return zrUtil.isObject(dataItem) && !zrUtil.isArray(dataItem) ? dataItem.value : dataItem;
            }
        }
    };
    return modelUtil;
});