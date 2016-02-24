define("crm-modules/common/echarts/coord/cartesian/Cartesian", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    function dimAxisMapper(dim) {
        return this._axes[dim];
    }
    var Cartesian = function(name) {
        this._axes = {};
        this._dimList = [];
        this.name = name || "";
    };
    Cartesian.prototype = {
        constructor: Cartesian,
        type: "cartesian",
        getAxis: function(dim) {
            return this._axes[dim];
        },
        getAxes: function() {
            return zrUtil.map(this._dimList, dimAxisMapper, this);
        },
        getAxesByScale: function(scaleType) {
            scaleType = scaleType.toLowerCase();
            return zrUtil.filter(this.getAxes(), function(axis) {
                return axis.scale.type === scaleType;
            });
        },
        addAxis: function(axis) {
            var dim = axis.dim;
            this._axes[dim] = axis;
            this._dimList.push(dim);
        },
        dataToCoord: function(val) {
            return this._dataCoordConvert(val, "dataToCoord");
        },
        coordToData: function(val) {
            return this._dataCoordConvert(val, "coordToData");
        },
        _dataCoordConvert: function(input, method) {
            var dimList = this._dimList;
            var output = input instanceof Array ? [] : {};
            for (var i = 0; i < dimList.length; i++) {
                var dim = dimList[i];
                var axis = this._axes[dim];
                output[dim] = axis[method](input[dim]);
            }
            return output;
        }
    };
    return Cartesian;
});