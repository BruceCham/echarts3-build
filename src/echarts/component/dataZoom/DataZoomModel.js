define("crm-modules/common/echarts/component/dataZoom/DataZoomModel", [ "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/core/env", "../../echarts", "../../util/model", "./AxisProxy" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var env = require("crm-modules/common/echarts/zrender/core/env");
    var echarts = require("../../echarts");
    var modelUtil = require("../../util/model");
    var AxisProxy = require("./AxisProxy");
    var each = zrUtil.each;
    var eachAxisDim = modelUtil.eachAxisDim;
    return echarts.extendComponentModel({
        type: "dataZoom",
        dependencies: [ "xAxis", "yAxis", "zAxis", "radiusAxis", "angleAxis", "series" ],
        defaultOption: {
            zlevel: 0,
            z: 4,
            orient: null,
            xAxisIndex: null,
            yAxisIndex: null,
            filterMode: "filter",
            throttle: 100,
            start: 0,
            end: 100,
            startValue: null,
            endValue: null
        },
        init: function(option, parentModel, ecModel) {
            this._autoMode;
            this._dataIntervalByAxis = {};
            this._dataInfo = {};
            this._axisProxies = {};
            this.textStyleModel;
            this.mergeDefaultAndTheme(option, ecModel);
            this.doInit({}, true);
        },
        mergeOption: function(newOption) {
            newOption && zrUtil.merge(this.option, newOption);
            this.doInit(newOption, false);
        },
        doInit: function(newOption, isInit) {
            if (!env.canvasSupported) {
                this.option.realtime = false;
            }
            this.textStyleModel = this.getModel("textStyle");
            this._resetTarget(newOption, isInit);
            this._giveAxisProxies();
            this._backup();
        },
        _giveAxisProxies: function() {
            var axisProxies = this._axisProxies;
            this.eachTargetAxis(function(dimNames, axisIndex, dataZoomModel, ecModel) {
                var axisModel = this.dependentModels[dimNames.axis][axisIndex];
                var axisProxy = axisModel.__dzAxisProxy || (axisModel.__dzAxisProxy = new AxisProxy(dimNames.name, axisIndex, this, ecModel));
                axisProxies[dimNames.name + "_" + axisIndex] = axisProxy;
            }, this);
        },
        _resetTarget: function(newOption, isInit) {
            this._resetAutoMode(newOption, isInit);
            var thisOption = this.option;
            eachAxisDim(function(dimNames) {
                var axisIndexName = dimNames.axisIndex;
                thisOption[axisIndexName] = autoMode === "axisIndex" ? [] : modelUtil.normalizeToArray(thisOption[axisIndexName]);
            }, this);
            var autoMode = this._autoMode;
            if (autoMode === "axisIndex") {
                this._autoSetAxisIndex();
            } else if (autoMode === "orient") {
                this._autoSetOrient();
            }
        },
        _resetAutoMode: function(newOption, isInit) {
            var option = isInit ? this.option : newOption;
            var hasIndexSpecified = false;
            eachAxisDim(function(dimNames) {
                if (option[dimNames.axisIndex] != null) {
                    hasIndexSpecified = true;
                }
            }, this);
            var orient = option.orient;
            if (orient == null && hasIndexSpecified) {
                this._autoMode = "orient";
            } else {
                if (orient == null) {
                    this.option.orient = "horizontal";
                }
                if (!hasIndexSpecified) {
                    this._autoMode = "axisIndex";
                }
            }
        },
        _autoSetAxisIndex: function() {
            var autoAxisIndex = this._autoMode === "axisIndex";
            var orient = this.get("orient");
            var thisOption = this.option;
            if (autoAxisIndex) {
                var dimNames = orient === "vertical" ? {
                    dim: "y",
                    axisIndex: "yAxisIndex",
                    axis: "yAxis"
                } : {
                    dim: "x",
                    axisIndex: "xAxisIndex",
                    axis: "xAxis"
                };
                if (this.dependentModels[dimNames.axis].length) {
                    thisOption[dimNames.axisIndex] = [ 0 ];
                    autoAxisIndex = false;
                }
            }
            if (autoAxisIndex) {
                eachAxisDim(function(dimNames) {
                    if (!autoAxisIndex) {
                        return;
                    }
                    var axisIndices = [];
                    var axisModels = this.dependentModels[dimNames.axis];
                    if (axisModels.length && !axisIndices.length) {
                        for (var i = 0, len = axisModels.length; i < len; i++) {
                            if (axisModels[i].get("type") === "category") {
                                axisIndices.push(i);
                            }
                        }
                    }
                    thisOption[dimNames.axisIndex] = axisIndices;
                    if (axisIndices.length) {
                        autoAxisIndex = false;
                    }
                }, this);
            }
            if (autoAxisIndex) {
                this.ecModel.eachSeries(function(seriesModel) {
                    if (this._isSeriesHasAllAxesTypeOf(seriesModel, "value")) {
                        eachAxisDim(function(dimNames) {
                            var axisIndices = thisOption[dimNames.axisIndex];
                            var axisIndex = seriesModel.get(dimNames.axisIndex);
                            if (zrUtil.indexOf(axisIndices, axisIndex) < 0) {
                                axisIndices.push(axisIndex);
                            }
                        });
                    }
                }, this);
            }
        },
        _autoSetOrient: function() {
            var dim;
            this.eachTargetAxis(function(dimNames) {
                !dim && (dim = dimNames.name);
            }, this);
            this.option.orient = dim === "y" ? "vertical" : "horizontal";
        },
        _isSeriesHasAllAxesTypeOf: function(seriesModel, axisType) {
            var is = true;
            eachAxisDim(function(dimNames) {
                var seriesAxisIndex = seriesModel.get(dimNames.axisIndex);
                var axisModel = this.dependentModels[dimNames.axis][seriesAxisIndex];
                if (!axisModel || axisModel.get("type") !== axisType) {
                    is = false;
                }
            }, this);
            return is;
        },
        _backup: function() {
            this.eachTargetAxis(function(dimNames, axisIndex, dataZoomModel, ecModel) {
                var axisModel = ecModel.getComponent(dimNames.axis, axisIndex);
                this.getAxisProxy(dimNames.name, axisIndex).backup(this, {
                    scale: axisModel.get("scale", true),
                    min: axisModel.get("min", true),
                    max: axisModel.get("max", true)
                });
            }, this);
        },
        getFirstTargetAxisModel: function() {
            var firstAxisModel;
            eachAxisDim(function(dimNames) {
                if (firstAxisModel == null) {
                    var indices = this.get(dimNames.axisIndex);
                    if (indices.length) {
                        firstAxisModel = this.dependentModels[dimNames.axis][indices[0]];
                    }
                }
            }, this);
            return firstAxisModel;
        },
        eachTargetAxis: function(callback, context) {
            var ecModel = this.ecModel;
            eachAxisDim(function(dimNames) {
                each(this.get(dimNames.axisIndex), function(axisIndex) {
                    callback.call(context, dimNames, axisIndex, this, ecModel);
                }, this);
            }, this);
        },
        getAxisProxy: function(dimName, axisIndex) {
            return this._axisProxies[dimName + "_" + axisIndex];
        },
        setRawRange: function(opt) {
            each([ "start", "end", "startValue", "endValue" ], function(name) {
                this.option[name] = opt[name];
            }, this);
        },
        getPercentRange: function() {
            var axisProxies = this._axisProxies;
            for (var key in axisProxies) {
                if (axisProxies.hasOwnProperty(key) && axisProxies[key].hostedBy(this)) {
                    return axisProxies[key].getDataPercentWindow();
                }
            }
            for (var key in axisProxies) {
                if (axisProxies.hasOwnProperty(key) && !axisProxies[key].hostedBy(this)) {
                    return axisProxies[key].getDataPercentWindow();
                }
            }
        }
    });
});