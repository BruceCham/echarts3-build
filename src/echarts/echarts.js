define("crm-modules/common/echarts/echarts", [ "./model/Global", "./ExtensionAPI", "./CoordinateSystem", "./model/OptionManager", "./model/Component", "./model/Series", "./view/Component", "./view/Chart", "./util/graphic", "crm-modules/common/echarts/zrender/zrender", "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/tool/color", "crm-modules/common/echarts/zrender/core/env", "crm-modules/common/echarts/zrender/mixin/Eventful", "./loading/default", "./visual/seriesColor", "./preprocessor/backwardCompat", "./util/graphic", "./util/number", "./util/format", "crm-modules/common/echarts/zrender/core/matrix", "crm-modules/common/echarts/zrender/core/vector" ], function(require, exports, module) {
    var GlobalModel = require("./model/Global");
    var ExtensionAPI = require("./ExtensionAPI");
    var CoordinateSystemManager = require("./CoordinateSystem");
    var OptionManager = require("./model/OptionManager");
    var ComponentModel = require("./model/Component");
    var SeriesModel = require("./model/Series");
    var ComponentView = require("./view/Component");
    var ChartView = require("./view/Chart");
    var graphic = require("./util/graphic");
    var zrender = require("crm-modules/common/echarts/zrender/zrender");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var colorTool = require("crm-modules/common/echarts/zrender/tool/color");
    var env = require("crm-modules/common/echarts/zrender/core/env");
    var Eventful = require("crm-modules/common/echarts/zrender/mixin/Eventful");
    var each = zrUtil.each;
    var VISUAL_CODING_STAGES = [ "echarts", "chart", "component" ];
    var PROCESSOR_STAGES = [ "transform", "filter", "statistic" ];
    function createRegisterEventWithLowercaseName(method) {
        return function(eventName, handler, context) {
            eventName = eventName && eventName.toLowerCase();
            Eventful.prototype[method].call(this, eventName, handler, context);
        };
    }
    function MessageCenter() {
        Eventful.call(this);
    }
    MessageCenter.prototype.on = createRegisterEventWithLowercaseName("on");
    MessageCenter.prototype.off = createRegisterEventWithLowercaseName("off");
    MessageCenter.prototype.one = createRegisterEventWithLowercaseName("one");
    zrUtil.mixin(MessageCenter, Eventful);
    function ECharts(dom, theme, opts) {
        opts = opts || {};
        if (theme) {
            each(optionPreprocessorFuncs, function(preProcess) {
                preProcess(theme);
            });
        }
        this.id;
        this.group;
        this._dom = dom;
        this._zr = zrender.init(dom, {
            renderer: opts.renderer || "canvas",
            devicePixelRatio: opts.devicePixelRatio
        });
        if (typeof theme === "string") {
            theme = themeStorage[theme];
        }
        this._theme = zrUtil.clone(theme);
        this._chartsViews = [];
        this._chartsMap = {};
        this._componentsViews = [];
        this._componentsMap = {};
        this._api = new ExtensionAPI(this);
        this._coordinateSystem = new CoordinateSystemManager();
        Eventful.call(this);
        this._messageCenter = new MessageCenter();
        this._initEvents();
        this.resize = zrUtil.bind(this.resize, this);
    }
    var echartsProto = ECharts.prototype;
    echartsProto.getDom = function() {
        return this._dom;
    };
    echartsProto.getZr = function() {
        return this._zr;
    };
    echartsProto.setOption = function(option, notMerge, notRefreshImmediately) {
        if (!this._model || notMerge) {
            this._model = new GlobalModel(null, null, this._theme, new OptionManager(this._api));
        }
        this._model.setOption(option, optionPreprocessorFuncs);
        updateMethods.prepareAndUpdate.call(this);
        !notRefreshImmediately && this._zr.refreshImmediately();
    };
    echartsProto.setTheme = function() {
        console.log("ECharts#setTheme() is DEPRECATED in ECharts 3.0");
    };
    echartsProto.getModel = function() {
        return this._model;
    };
    echartsProto.getOption = function() {
        return zrUtil.clone(this._model.option);
    };
    echartsProto.getWidth = function() {
        return this._zr.getWidth();
    };
    echartsProto.getHeight = function() {
        return this._zr.getHeight();
    };
    echartsProto.getRenderedCanvas = function(opts) {
        if (!env.canvasSupported) {
            return;
        }
        opts = opts || {};
        opts.pixelRatio = opts.pixelRatio || 1;
        opts.backgroundColor = opts.backgroundColor || this._model.get("backgroundColor");
        var zr = this._zr;
        var list = zr.storage.getDisplayList();
        zrUtil.each(list, function(el) {
            el.stopAnimation(true);
        });
        return zr.painter.getRenderedCanvas(opts);
    };
    echartsProto.getDataURL = function(opts) {
        opts = opts || {};
        var excludeComponents = opts.excludeComponents;
        var ecModel = this._model;
        var excludesComponentViews = [];
        var self = this;
        each(excludeComponents, function(componentType) {
            ecModel.eachComponent({
                mainType: componentType
            }, function(component) {
                var view = self._componentsMap[component.__viewId];
                if (!view.group.ignore) {
                    excludesComponentViews.push(view);
                    view.group.ignore = true;
                }
            });
        });
        var url = this.getRenderedCanvas(opts).toDataURL("image/" + (opts && opts.type || "png"));
        each(excludesComponentViews, function(view) {
            view.group.ignore = false;
        });
        return url;
    };
    echartsProto.getConnectedDataURL = function(opts) {
        if (!env.canvasSupported) {
            return;
        }
        var groupId = this.group;
        var mathMin = Math.min;
        var mathMax = Math.max;
        var MAX_NUMBER = Infinity;
        if (connectedGroups[groupId]) {
            var left = MAX_NUMBER;
            var top = MAX_NUMBER;
            var right = -MAX_NUMBER;
            var bottom = -MAX_NUMBER;
            var canvasList = [];
            var dpr = opts && opts.pixelRatio || 1;
            for (var id in instances) {
                var chart = instances[id];
                if (chart.group === groupId) {
                    var canvas = chart.getRenderedCanvas(zrUtil.clone(opts));
                    var boundingRect = chart.getDom().getBoundingClientRect();
                    left = mathMin(boundingRect.left, left);
                    top = mathMin(boundingRect.top, top);
                    right = mathMax(boundingRect.right, right);
                    bottom = mathMax(boundingRect.bottom, bottom);
                    canvasList.push({
                        dom: canvas,
                        left: boundingRect.left,
                        top: boundingRect.top
                    });
                }
            }
            left *= dpr;
            top *= dpr;
            right *= dpr;
            bottom *= dpr;
            var width = right - left;
            var height = bottom - top;
            var targetCanvas = zrUtil.createCanvas();
            targetCanvas.width = width;
            targetCanvas.height = height;
            var zr = zrender.init(targetCanvas);
            each(canvasList, function(item) {
                var img = new graphic.Image({
                    style: {
                        x: item.left * dpr - left,
                        y: item.top * dpr - top,
                        image: item.dom
                    }
                });
                zr.add(img);
            });
            zr.refreshImmediately();
            return targetCanvas.toDataURL("image/" + (opts && opts.type || "png"));
        } else {
            return this.getDataURL(opts);
        }
    };
    var updateMethods = {
        update: function(payload) {
            var ecModel = this._model;
            if (!ecModel) {
                return;
            }
            ecModel.restoreData();
            processData.call(this, ecModel);
            stackSeriesData.call(this, ecModel);
            this._coordinateSystem.update(ecModel, this._api);
            doLayout.call(this, ecModel, payload);
            doVisualCoding.call(this, ecModel, payload);
            doRender.call(this, ecModel, payload);
            var backgroundColor = ecModel.get("backgroundColor") || "transparent";
            var painter = this._zr.painter;
            if (painter.isSingleCanvas && painter.isSingleCanvas()) {
                this._zr.configLayer(0, {
                    clearColor: backgroundColor
                });
            } else {
                if (!env.canvasSupported) {
                    var colorArr = colorTool.parse(backgroundColor);
                    backgroundColor = colorTool.stringify(colorArr, "rgb");
                    if (colorArr[3] === 0) {
                        backgroundColor = "transparent";
                    }
                }
                backgroundColor = backgroundColor;
                this._dom.style.backgroundColor = backgroundColor;
            }
        },
        updateView: function(payload) {
            var ecModel = this._model;
            if (!ecModel) {
                return;
            }
            doLayout.call(this, ecModel, payload);
            doVisualCoding.call(this, ecModel, payload);
            invokeUpdateMethod.call(this, "updateView", ecModel, payload);
        },
        updateVisual: function(payload) {
            var ecModel = this._model;
            if (!ecModel) {
                return;
            }
            doVisualCoding.call(this, ecModel, payload);
            invokeUpdateMethod.call(this, "updateVisual", ecModel, payload);
        },
        updateLayout: function(payload) {
            var ecModel = this._model;
            if (!ecModel) {
                return;
            }
            doLayout.call(this, ecModel, payload);
            invokeUpdateMethod.call(this, "updateLayout", ecModel, payload);
        },
        highlight: function(payload) {
            toggleHighlight.call(this, "highlight", payload);
        },
        downplay: function(payload) {
            toggleHighlight.call(this, "downplay", payload);
        },
        prepareAndUpdate: function(payload) {
            var ecModel = this._model;
            prepareView.call(this, "component", ecModel);
            prepareView.call(this, "chart", ecModel);
            updateMethods.update.call(this, payload);
        }
    };
    function toggleHighlight(method, payload) {
        var ecModel = this._model;
        if (!ecModel) {
            return;
        }
        ecModel.eachComponent({
            mainType: "series",
            query: payload
        }, function(seriesModel, index) {
            var chartView = this._chartsMap[seriesModel.__viewId];
            if (chartView && chartView.__alive) {
                chartView[method](seriesModel, ecModel, this._api, payload);
            }
        }, this);
    }
    echartsProto.resize = function() {
        this._zr.resize();
        var optionChanged = this._model && this._model.resetOption("media");
        updateMethods[optionChanged ? "prepareAndUpdate" : "update"].call(this);
        this._loadingFX && this._loadingFX.resize();
    };
    var defaultLoadingEffect = require("./loading/default");
    echartsProto.showLoading = function(name, cfg) {
        if (zrUtil.isObject(name)) {
            cfg = name;
            name = "default";
        }
        var el = defaultLoadingEffect(this._api, cfg);
        var zr = this._zr;
        this._loadingFX = el;
        zr.add(el);
    };
    echartsProto.hideLoading = function() {
        this._loadingFX && this._zr.remove(this._loadingFX);
        this._loadingFX = null;
    };
    echartsProto.makeActionFromEvent = function(eventObj) {
        var payload = zrUtil.extend({}, eventObj);
        payload.type = eventActionMap[eventObj.type];
        return payload;
    };
    echartsProto.dispatchAction = function(payload, silent) {
        var actionWrap = actions[payload.type];
        if (actionWrap) {
            var actionInfo = actionWrap.actionInfo;
            var updateMethod = actionInfo.update || "update";
            var payloads = [ payload ];
            var batched = false;
            if (payload.batch) {
                batched = true;
                payloads = zrUtil.map(payload.batch, function(item) {
                    item = zrUtil.defaults(zrUtil.extend({}, item), payload);
                    item.batch = null;
                    return item;
                });
            }
            var eventObjBatch = [];
            var eventObj;
            var isHighlightOrDownplay = payload.type === "highlight" || payload.type === "downplay";
            for (var i = 0; i < payloads.length; i++) {
                var batchItem = payloads[i];
                eventObj = actionWrap.action(batchItem, this._model);
                eventObj = eventObj || zrUtil.extend({}, batchItem);
                eventObj.type = actionInfo.event || eventObj.type;
                eventObjBatch.push(eventObj);
                isHighlightOrDownplay && updateMethods[updateMethod].call(this, batchItem);
            }
            updateMethod !== "none" && !isHighlightOrDownplay && updateMethods[updateMethod].call(this, payload);
            if (!silent) {
                if (batched) {
                    eventObj = {
                        type: eventObjBatch[0].type,
                        batch: eventObjBatch
                    };
                } else {
                    eventObj = eventObjBatch[0];
                }
                this._messageCenter.trigger(eventObj.type, eventObj);
            }
        }
    };
    echartsProto.on = createRegisterEventWithLowercaseName("on");
    echartsProto.off = createRegisterEventWithLowercaseName("off");
    echartsProto.one = createRegisterEventWithLowercaseName("one");
    function invokeUpdateMethod(methodName, ecModel, payload) {
        var api = this._api;
        each(this._componentsViews, function(component) {
            var componentModel = component.__model;
            component[methodName](componentModel, ecModel, api, payload);
            updateZ(componentModel, component);
        }, this);
        ecModel.eachSeries(function(seriesModel, idx) {
            var chart = this._chartsMap[seriesModel.__viewId];
            chart[methodName](seriesModel, ecModel, api, payload);
            updateZ(seriesModel, chart);
        }, this);
    }
    function prepareView(type, ecModel) {
        var isComponent = type === "component";
        var viewList = isComponent ? this._componentsViews : this._chartsViews;
        var viewMap = isComponent ? this._componentsMap : this._chartsMap;
        var zr = this._zr;
        for (var i = 0; i < viewList.length; i++) {
            viewList[i].__alive = false;
        }
        ecModel[isComponent ? "eachComponent" : "eachSeries"](function(componentType, model) {
            if (isComponent) {
                if (componentType === "series") {
                    return;
                }
            } else {
                model = componentType;
            }
            var viewId = model.id + "_" + model.type;
            var view = viewMap[viewId];
            if (!view) {
                var classType = ComponentModel.parseClassType(model.type);
                var Clazz = isComponent ? ComponentView.getClass(classType.main, classType.sub) : ChartView.getClass(classType.sub);
                if (Clazz) {
                    view = new Clazz();
                    view.init(ecModel, this._api);
                    viewMap[viewId] = view;
                    viewList.push(view);
                    zr.add(view.group);
                } else {
                    return;
                }
            }
            model.__viewId = viewId;
            view.__alive = true;
            view.__id = viewId;
            view.__model = model;
        }, this);
        for (var i = 0; i < viewList.length; ) {
            var view = viewList[i];
            if (!view.__alive) {
                zr.remove(view.group);
                view.dispose(ecModel, this._api);
                viewList.splice(i, 1);
                delete viewMap[view.__id];
            } else {
                i++;
            }
        }
    }
    function processData(ecModel) {
        each(PROCESSOR_STAGES, function(stage) {
            each(dataProcessorFuncs[stage] || [], function(process) {
                process(ecModel);
            });
        });
    }
    function stackSeriesData(ecModel) {
        var stackedDataMap = {};
        ecModel.eachSeries(function(series) {
            var stack = series.get("stack");
            var data = series.getData();
            if (stack && data.type === "list") {
                var previousStack = stackedDataMap[stack];
                if (previousStack) {
                    data.stackedOn = previousStack;
                }
                stackedDataMap[stack] = data;
            }
        });
    }
    function doLayout(ecModel, payload) {
        var api = this._api;
        each(layoutFuncs, function(layout) {
            layout(ecModel, api, payload);
        });
    }
    function doVisualCoding(ecModel, payload) {
        each(VISUAL_CODING_STAGES, function(stage) {
            each(visualCodingFuncs[stage] || [], function(visualCoding) {
                visualCoding(ecModel, payload);
            });
        });
    }
    function doRender(ecModel, payload) {
        var api = this._api;
        each(this._componentsViews, function(componentView) {
            var componentModel = componentView.__model;
            componentView.render(componentModel, ecModel, api, payload);
            updateZ(componentModel, componentView);
        }, this);
        each(this._chartsViews, function(chart) {
            chart.__alive = false;
        }, this);
        ecModel.eachSeries(function(seriesModel, idx) {
            var chartView = this._chartsMap[seriesModel.__viewId];
            chartView.__alive = true;
            chartView.render(seriesModel, ecModel, api, payload);
            updateZ(seriesModel, chartView);
        }, this);
        each(this._chartsViews, function(chart) {
            if (!chart.__alive) {
                chart.remove(ecModel, api);
            }
        }, this);
    }
    var MOUSE_EVENT_NAMES = [ "click", "dblclick", "mouseover", "mouseout", "globalout" ];
    echartsProto._initEvents = function() {
        var zr = this._zr;
        each(MOUSE_EVENT_NAMES, function(eveName) {
            zr.on(eveName, function(e) {
                var ecModel = this.getModel();
                var el = e.target;
                if (el && el.dataIndex != null) {
                    var hostModel = el.hostModel || ecModel.getSeriesByIndex(el.seriesIndex);
                    var params = hostModel && hostModel.getDataParams(el.dataIndex) || {};
                    params.event = e;
                    params.type = eveName;
                    this.trigger(eveName, params);
                }
            }, this);
        }, this);
        each(eventActionMap, function(actionType, eventType) {
            this._messageCenter.on(eventType, function(event) {
                this.trigger(eventType, event);
            }, this);
        }, this);
    };
    echartsProto.isDisposed = function() {
        return this._disposed;
    };
    echartsProto.clear = function() {
        this.setOption({}, true);
    };
    echartsProto.dispose = function() {
        this._disposed = true;
        var api = this._api;
        var ecModel = this._model;
        each(this._componentsViews, function(component) {
            component.dispose(ecModel, api);
        });
        each(this._chartsViews, function(chart) {
            chart.dispose(ecModel, api);
        });
        this._zr.dispose();
        instances[this.id] = null;
    };
    zrUtil.mixin(ECharts, Eventful);
    function updateZ(model, view) {
        var z = model.get("z");
        var zlevel = model.get("zlevel");
        view.group.traverse(function(el) {
            z != null && (el.z = z);
            zlevel != null && (el.zlevel = zlevel);
        });
    }
    var actions = [];
    var eventActionMap = {};
    var layoutFuncs = [];
    var dataProcessorFuncs = {};
    var optionPreprocessorFuncs = [];
    var visualCodingFuncs = {};
    var themeStorage = {};
    var instances = {};
    var connectedGroups = {};
    var idBase = new Date() - 0;
    var groupIdBase = new Date() - 0;
    var DOM_ATTRIBUTE_KEY = "_echarts_instance_";
    var echarts = {
        version: "3.0.2",
        dependencies: {
            zrender: "3.0.1"
        }
    };
    function enableConnect(chart) {
        var STATUS_PENDING = 0;
        var STATUS_UPDATING = 1;
        var STATUS_UPDATED = 2;
        var STATUS_KEY = "__connectUpdateStatus";
        function updateConnectedChartsStatus(charts, status) {
            for (var i = 0; i < charts.length; i++) {
                var otherChart = charts[i];
                otherChart[STATUS_KEY] = status;
            }
        }
        zrUtil.each(eventActionMap, function(actionType, eventType) {
            chart._messageCenter.on(eventType, function(event) {
                if (connectedGroups[chart.group] && chart[STATUS_KEY] !== STATUS_PENDING) {
                    var action = chart.makeActionFromEvent(event);
                    var otherCharts = [];
                    for (var id in instances) {
                        var otherChart = instances[id];
                        if (otherChart !== chart && otherChart.group === chart.group) {
                            otherCharts.push(otherChart);
                        }
                    }
                    updateConnectedChartsStatus(otherCharts, STATUS_PENDING);
                    each(otherCharts, function(otherChart) {
                        if (otherChart[STATUS_KEY] !== STATUS_UPDATING) {
                            otherChart.dispatchAction(action);
                        }
                    });
                    updateConnectedChartsStatus(otherCharts, STATUS_UPDATED);
                }
            });
        });
    }
    echarts.init = function(dom, theme, opts) {
        if (zrender.version.replace(".", "") - 0 < echarts.dependencies.zrender.replace(".", "") - 0) {
            throw new Error("ZRender " + zrender.version + " is too old for ECharts " + echarts.version + ". Current version need ZRender " + echarts.dependencies.zrender + "+");
        }
        if (!dom) {
            throw new Error("Initialize failed: invalid dom.");
        }
        var chart = new ECharts(dom, theme, opts);
        chart.id = "ec_" + idBase++;
        instances[chart.id] = chart;
        dom.setAttribute && dom.setAttribute(DOM_ATTRIBUTE_KEY, chart.id);
        enableConnect(chart);
        return chart;
    };
    echarts.connect = function(groupId) {
        if (zrUtil.isArray(groupId)) {
            var charts = groupId;
            groupId = null;
            zrUtil.each(charts, function(chart) {
                if (chart.group != null) {
                    groupId = chart.group;
                }
            });
            groupId = groupId || "g_" + groupIdBase++;
            zrUtil.each(charts, function(chart) {
                chart.group = groupId;
            });
        }
        connectedGroups[groupId] = true;
        return groupId;
    };
    echarts.disConnect = function(groupId) {
        connectedGroups[groupId] = false;
    };
    echarts.dispose = function(chart) {
        if (zrUtil.isDom(chart)) {
            chart = echarts.getInstanceByDom(chart);
        } else if (typeof chart === "string") {
            chart = instances[chart];
        }
        if (chart instanceof ECharts && !chart.isDisposed()) {
            chart.dispose();
        }
    };
    echarts.getInstanceByDom = function(dom) {
        var key = dom.getAttribute(DOM_ATTRIBUTE_KEY);
        return instances[key];
    };
    echarts.getInstanceById = function(key) {
        return instances[key];
    };
    echarts.registerTheme = function(name, theme) {
        themeStorage[name] = theme;
    };
    echarts.registerPreprocessor = function(preprocessorFunc) {
        optionPreprocessorFuncs.push(preprocessorFunc);
    };
    echarts.registerProcessor = function(stage, processorFunc) {
        if (zrUtil.indexOf(PROCESSOR_STAGES, stage) < 0) {
            throw new Error("stage should be one of " + PROCESSOR_STAGES);
        }
        var funcs = dataProcessorFuncs[stage] || (dataProcessorFuncs[stage] = []);
        funcs.push(processorFunc);
    };
    echarts.registerAction = function(actionInfo, eventName, action) {
        if (typeof eventName === "function") {
            action = eventName;
            eventName = "";
        }
        var actionType = zrUtil.isObject(actionInfo) ? actionInfo.type : [ actionInfo, actionInfo = {
            event: eventName
        } ][0];
        actionInfo.event = (actionInfo.event || actionType).toLowerCase();
        eventName = actionInfo.event;
        if (!actions[actionType]) {
            actions[actionType] = {
                action: action,
                actionInfo: actionInfo
            };
        }
        eventActionMap[eventName] = actionType;
    };
    echarts.registerCoordinateSystem = function(type, CoordinateSystem) {
        CoordinateSystemManager.register(type, CoordinateSystem);
    };
    echarts.registerLayout = function(layout) {
        if (zrUtil.indexOf(layoutFuncs, layout) < 0) {
            layoutFuncs.push(layout);
        }
    };
    echarts.registerVisualCoding = function(stage, visualCodingFunc) {
        if (zrUtil.indexOf(VISUAL_CODING_STAGES, stage) < 0) {
            throw new Error("stage should be one of " + VISUAL_CODING_STAGES);
        }
        var funcs = visualCodingFuncs[stage] || (visualCodingFuncs[stage] = []);
        funcs.push(visualCodingFunc);
    };
    echarts.extendChartView = function(opts) {
        return ChartView.extend(opts);
    };
    echarts.extendComponentModel = function(opts) {
        return ComponentModel.extend(opts);
    };
    echarts.extendSeriesModel = function(opts) {
        return SeriesModel.extend(opts);
    };
    echarts.extendComponentView = function(opts) {
        return ComponentView.extend(opts);
    };
    echarts.setCanvasCreator = function(creator) {
        zrUtil.createCanvas = creator;
    };
    echarts.registerVisualCoding("echarts", zrUtil.curry(require("./visual/seriesColor"), "", "itemStyle"));
    echarts.registerPreprocessor(require("./preprocessor/backwardCompat"));
    echarts.registerAction({
        type: "highlight",
        event: "highlight",
        update: "highlight"
    }, zrUtil.noop);
    echarts.registerAction({
        type: "downplay",
        event: "downplay",
        update: "downplay"
    }, zrUtil.noop);
    echarts.graphic = require("./util/graphic");
    echarts.number = require("./util/number");
    echarts.format = require("./util/format");
    echarts.matrix = require("crm-modules/common/echarts/zrender/core/matrix");
    echarts.vector = require("crm-modules/common/echarts/zrender/core/vector");
    echarts.util = {};
    each([ "map", "each", "filter", "indexOf", "inherits", "reduce", "filter", "bind", "curry", "isArray", "isString", "isObject", "isFunction", "extend" ], function(name) {
        echarts.util[name] = zrUtil[name];
    });
    return echarts;
});