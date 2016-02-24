define("crm-modules/common/echarts/chart/treemap/TreemapView", [ "crm-modules/common/echarts/zrender/core/util", "../../util/graphic", "../../data/DataDiffer", "./helper", "./Breadcrumb", "../../component/helper/RoamController", "crm-modules/common/echarts/zrender/core/BoundingRect", "crm-modules/common/echarts/zrender/core/matrix", "../../util/animation", "../../echarts" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var graphic = require("../../util/graphic");
    var DataDiffer = require("../../data/DataDiffer");
    var helper = require("./helper");
    var Breadcrumb = require("./Breadcrumb");
    var RoamController = require("../../component/helper/RoamController");
    var BoundingRect = require("crm-modules/common/echarts/zrender/core/BoundingRect");
    var matrix = require("crm-modules/common/echarts/zrender/core/matrix");
    var animationUtil = require("../../util/animation");
    var bind = zrUtil.bind;
    var Group = graphic.Group;
    var Rect = graphic.Rect;
    var each = zrUtil.each;
    var DRAG_THRESHOLD = 3;
    return require("../../echarts").extendChartView({
        type: "treemap",
        init: function(o, api) {
            this._containerGroup;
            this._storage = createStorage();
            this._oldTree;
            this._breadcrumb;
            this._controller;
            this._state = "ready";
            this._mayClick;
        },
        render: function(seriesModel, ecModel, api, payload) {
            var models = ecModel.findComponents({
                mainType: "series",
                subType: "treemap",
                query: payload
            });
            if (zrUtil.indexOf(models, seriesModel) < 0) {
                return;
            }
            this.seriesModel = seriesModel;
            this.api = api;
            this.ecModel = ecModel;
            var payloadType = payload && payload.type;
            var layoutInfo = seriesModel.layoutInfo;
            var isInit = !this._oldTree;
            var containerGroup = this._giveContainerGroup(layoutInfo);
            var renderResult = this._doRender(containerGroup, seriesModel);
            !isInit && (!payloadType || payloadType === "treemapZoomToNode") ? this._doAnimation(containerGroup, renderResult, seriesModel) : renderResult.renderFinally();
            this._resetController(api);
            var targetInfo = helper.retrieveTargetInfo(payload, seriesModel);
            this._renderBreadcrumb(seriesModel, api, targetInfo);
        },
        _giveContainerGroup: function(layoutInfo) {
            var containerGroup = this._containerGroup;
            if (!containerGroup) {
                containerGroup = this._containerGroup = new Group();
                this._initEvents(containerGroup);
                this.group.add(containerGroup);
            }
            containerGroup.position = [ layoutInfo.x, layoutInfo.y ];
            return containerGroup;
        },
        _doRender: function(containerGroup, seriesModel) {
            var thisTree = seriesModel.getData().tree;
            var oldTree = this._oldTree;
            var lastsForAnimation = createStorage();
            var thisStorage = createStorage();
            var oldStorage = this._storage;
            var willInvisibleEls = [];
            var willVisibleEls = [];
            var willDeleteEls = [];
            var renderNode = bind(this._renderNode, this, thisStorage, oldStorage, lastsForAnimation, willInvisibleEls, willVisibleEls);
            var viewRoot = seriesModel.getViewRoot();
            dualTravel(thisTree.root ? [ thisTree.root ] : [], oldTree && oldTree.root ? [ oldTree.root ] : [], containerGroup, thisTree === oldTree || !oldTree, viewRoot === thisTree.root);
            var willDeleteEls = clearStorage(oldStorage);
            this._oldTree = thisTree;
            this._storage = thisStorage;
            return {
                lastsForAnimation: lastsForAnimation,
                willDeleteEls: willDeleteEls,
                renderFinally: renderFinally
            };
            function dualTravel(thisViewChildren, oldViewChildren, parentGroup, sameTree, inView) {
                if (sameTree) {
                    oldViewChildren = thisViewChildren;
                    each(thisViewChildren, function(child, index) {
                        !child.isRemoved() && processNode(index, index);
                    });
                } else {
                    new DataDiffer(oldViewChildren, thisViewChildren, getKey, getKey).add(processNode).update(processNode).remove(zrUtil.curry(processNode, null)).execute();
                }
                function getKey(node) {
                    return node.getId();
                }
                function processNode(newIndex, oldIndex) {
                    var thisNode = newIndex != null ? thisViewChildren[newIndex] : null;
                    var oldNode = oldIndex != null ? oldViewChildren[oldIndex] : null;
                    var subInView = inView || thisNode === viewRoot;
                    if (!subInView) {
                        thisNode = null;
                    }
                    var group = renderNode(thisNode, oldNode, parentGroup);
                    group && dualTravel(thisNode && thisNode.viewChildren || [], oldNode && oldNode.viewChildren || [], group, sameTree, subInView);
                }
            }
            function clearStorage(storage) {
                var willDeleteEls = createStorage();
                storage && each(storage, function(store, storageName) {
                    var delEls = willDeleteEls[storageName];
                    each(store, function(el) {
                        el && (delEls.push(el), el.__tmWillDelete = storageName);
                    });
                });
                return willDeleteEls;
            }
            function renderFinally() {
                each(willDeleteEls, function(els) {
                    each(els, function(el) {
                        el.parent && el.parent.remove(el);
                    });
                });
                each(willInvisibleEls, function(el) {
                    el.invisible = true;
                });
                each(willVisibleEls, function(el) {
                    el.invisible = false;
                    el.__tmWillVisible = false;
                    el.dirty();
                });
            }
        },
        _renderNode: function(thisStorage, oldStorage, lastsForAnimation, willInvisibleEls, willVisibleEls, thisNode, oldNode, parentGroup) {
            var thisRawIndex = thisNode && thisNode.getRawIndex();
            var oldRawIndex = oldNode && oldNode.getRawIndex();
            if (!thisNode) {
                return;
            }
            var layout = thisNode.getLayout();
            var thisWidth = layout.width;
            var thisHeight = layout.height;
            var invisible = layout.invisible;
            var group = giveGraphic("nodeGroup", Group);
            if (!group) {
                return;
            }
            parentGroup.add(group);
            group.position = [ layout.x, layout.y ];
            group.__tmNodeWidth = thisWidth;
            group.__tmNodeHeight = thisHeight;
            var bg = giveGraphic("background", Rect);
            if (bg) {
                bg.setShape({
                    x: 0,
                    y: 0,
                    width: thisWidth,
                    height: thisHeight
                });
                updateStyle(bg, {
                    fill: thisNode.getVisual("borderColor", true)
                });
                group.add(bg);
            }
            var thisViewChildren = thisNode.viewChildren;
            if (!thisViewChildren || !thisViewChildren.length) {
                var borderWidth = layout.borderWidth;
                var content = giveGraphic("content", Rect);
                if (content) {
                    var contentWidth = Math.max(thisWidth - 2 * borderWidth, 0);
                    var contentHeight = Math.max(thisHeight - 2 * borderWidth, 0);
                    var labelModel = thisNode.getModel("label.normal");
                    var textStyleModel = thisNode.getModel("label.normal.textStyle");
                    var text = thisNode.getModel().get("name");
                    var textRect = textStyleModel.getTextRect(text);
                    var showLabel = labelModel.get("show");
                    if (!showLabel || textRect.height > contentHeight) {
                        text = "";
                    } else if (textRect.width > contentWidth) {
                        text = textStyleModel.get("ellipsis") ? textStyleModel.ellipsis(text, contentWidth) : "";
                    }
                    content.dataIndex = thisNode.dataIndex;
                    content.seriesIndex = this.seriesModel.seriesIndex;
                    content.culling = true;
                    content.setShape({
                        x: borderWidth,
                        y: borderWidth,
                        width: contentWidth,
                        height: contentHeight
                    });
                    updateStyle(content, {
                        fill: thisNode.getVisual("color", true),
                        text: text,
                        textPosition: labelModel.get("position"),
                        textFill: textStyleModel.getTextColor(),
                        textAlign: textStyleModel.get("align"),
                        textBaseline: textStyleModel.get("baseline"),
                        textFont: textStyleModel.getFont()
                    });
                    group.add(content);
                }
            }
            return group;
            function giveGraphic(storageName, Ctor) {
                var element = oldRawIndex != null && oldStorage[storageName][oldRawIndex];
                var lasts = lastsForAnimation[storageName];
                if (element) {
                    oldStorage[storageName][oldRawIndex] = null;
                    prepareAnimationWhenHasOld(lasts, element, storageName);
                } else if (!invisible) {
                    element = new Ctor();
                    prepareAnimationWhenNoOld(lasts, element, storageName);
                }
                return thisStorage[storageName][thisRawIndex] = element;
            }
            function prepareAnimationWhenHasOld(lasts, element, storageName) {
                var lastCfg = lasts[thisRawIndex] = {};
                lastCfg.old = storageName === "nodeGroup" ? element.position.slice() : zrUtil.extend({}, element.shape);
            }
            function prepareAnimationWhenNoOld(lasts, element, storageName) {
                if (storageName === "background") {
                    element.invisible = true;
                    element.__tmWillVisible = true;
                    willVisibleEls.push(element);
                } else {
                    var parentNode = thisNode.parentNode;
                    var parentOldBg;
                    var parentOldX = 0;
                    var parentOldY = 0;
                    if (parentNode && (parentOldBg = lastsForAnimation.background[parentNode.getRawIndex()])) {
                        parentOldX = parentOldBg.old.width;
                        parentOldY = parentOldBg.old.height;
                    }
                    var lastCfg = lasts[thisRawIndex] = {};
                    lastCfg.old = storageName === "nodeGroup" ? [ parentOldX, parentOldY ] : {
                        x: parentOldX,
                        y: parentOldY,
                        width: 0,
                        height: 0
                    };
                    lastCfg.fadein = storageName !== "nodeGroup";
                }
            }
            function updateStyle(element, style) {
                if (!invisible) {
                    element.setStyle(style);
                    if (!element.__tmWillVisible) {
                        element.invisible = false;
                    }
                } else {
                    !element.invisible && willInvisibleEls.push(element);
                }
            }
        },
        _doAnimation: function(containerGroup, renderResult, seriesModel) {
            if (!seriesModel.get("animation")) {
                return;
            }
            var duration = seriesModel.get("animationDurationUpdate");
            var easing = seriesModel.get("animationEasing");
            var animationWrap = animationUtil.createWrap();
            var viewRoot = this.seriesModel.getViewRoot();
            var rootGroup = this._storage.nodeGroup[viewRoot.getRawIndex()];
            rootGroup && rootGroup.traverse(function(el) {
                var storageName;
                if (el.invisible || !(storageName = el.__tmWillDelete)) {
                    return;
                }
                var targetX = 0;
                var targetY = 0;
                var parent = el.parent;
                if (!parent.__tmWillDelete) {
                    targetX = parent.__tmNodeWidth;
                    targetY = parent.__tmNodeHeight;
                }
                var target = storageName === "nodeGroup" ? {
                    position: [ targetX, targetY ],
                    style: {
                        opacity: 0
                    }
                } : {
                    shape: {
                        x: targetX,
                        y: targetY,
                        width: 0,
                        height: 0
                    },
                    style: {
                        opacity: 0
                    }
                };
                animationWrap.add(el, target, duration, easing);
            });
            each(this._storage, function(store, storageName) {
                each(store, function(el, rawIndex) {
                    var last = renderResult.lastsForAnimation[storageName][rawIndex];
                    var target;
                    if (!last) {
                        return;
                    }
                    if (storageName === "nodeGroup") {
                        target = {
                            position: el.position.slice()
                        };
                        el.position = last.old;
                    } else {
                        target = {
                            shape: zrUtil.extend({}, el.shape)
                        };
                        el.setShape(last.old);
                        if (last.fadein) {
                            el.setStyle("opacity", 0);
                            target.style = {
                                opacity: 1
                            };
                        } else if (el.style.opacity !== 1) {
                            target.style = {
                                opacity: 1
                            };
                        }
                    }
                    animationWrap.add(el, target, duration, easing);
                });
            }, this);
            this._state = "animating";
            animationWrap.done(bind(function() {
                this._state = "ready";
                renderResult.renderFinally();
            }, this)).start();
        },
        _resetController: function(api) {
            var controller = this._controller;
            if (!controller) {
                controller = this._controller = new RoamController(api.getZr());
                controller.enable();
                controller.on("pan", bind(this._onPan, this));
                controller.on("zoom", bind(this._onZoom, this));
            }
            controller.rect = new BoundingRect(0, 0, api.getWidth(), api.getHeight());
        },
        _clearController: function() {
            var controller = this._controller;
            if (controller) {
                controller.off("pan").off("zoom");
                controller = null;
            }
        },
        _isRoamEnabled: function(type) {
            var roam = this.seriesModel.get("roam");
            return roam === true || (roam === "scale" || roam === "zoom") && type === "zoom" || roam === type && type === "move";
        },
        _onPan: function(dx, dy) {
            if (!this._isRoamEnabled("move")) {
                return;
            }
            this._mayClick = false;
            if (this._state !== "animating" && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
                var viewRoot = this.seriesModel.getViewRoot();
                if (!viewRoot) {
                    return;
                }
                var rootLayout = viewRoot.getLayout();
                if (!rootLayout) {
                    return;
                }
                this.api.dispatchAction({
                    type: "treemapMove",
                    from: this.uid,
                    seriesId: this.seriesModel.id,
                    rootRect: {
                        x: rootLayout.x + dx,
                        y: rootLayout.y + dy,
                        width: rootLayout.width,
                        height: rootLayout.height
                    }
                });
            }
        },
        _onZoom: function(scale, mouseX, mouseY) {
            if (!this._isRoamEnabled("zoom")) {
                return;
            }
            this._mayClick = false;
            if (this._state !== "animating") {
                var viewRoot = this.seriesModel.getViewRoot();
                if (!viewRoot) {
                    return;
                }
                var rootLayout = viewRoot.getLayout();
                if (!rootLayout) {
                    return;
                }
                var rect = new BoundingRect(rootLayout.x, rootLayout.y, rootLayout.width, rootLayout.height);
                var layoutInfo = this.seriesModel.layoutInfo;
                mouseX -= layoutInfo.x;
                mouseY -= layoutInfo.y;
                var m = matrix.create();
                matrix.translate(m, m, [ -mouseX, -mouseY ]);
                matrix.scale(m, m, [ scale, scale ]);
                matrix.translate(m, m, [ mouseX, mouseY ]);
                rect.applyTransform(m);
                this.api.dispatchAction({
                    type: "treemapRender",
                    from: this.uid,
                    seriesId: this.seriesModel.id,
                    rootRect: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    }
                });
            }
        },
        _initEvents: function(containerGroup) {
            containerGroup.on("mousedown", function(e) {
                this._state === "ready" && (this._mayClick = true);
            }, this);
            containerGroup.on("mouseup", function(e) {
                if (this._mayClick) {
                    this._mayClick = false;
                    this._state === "ready" && onClick.call(this, e);
                }
            }, this);
            function onClick(e) {
                var nodeClick = this.seriesModel.get("nodeClick", true);
                if (!nodeClick) {
                    return;
                }
                var targetInfo = this.findTarget(e.offsetX, e.offsetY);
                if (targetInfo) {
                    if (nodeClick === "zoomToNode") {
                        this._zoomToNode(targetInfo);
                    } else if (nodeClick === "link") {
                        var node = targetInfo.node;
                        var itemModel = node.hostTree.data.getItemModel(node.dataIndex);
                        var link = itemModel.get("link", true);
                        var linkTarget = itemModel.get("target", true) || "blank";
                        link && window.open(link, linkTarget);
                    }
                }
            }
        },
        _renderBreadcrumb: function(seriesModel, api, targetInfo) {
            if (!targetInfo) {
                targetInfo = this.findTarget(api.getWidth() / 2, api.getHeight() / 2);
                if (!targetInfo) {
                    targetInfo = {
                        node: seriesModel.getData().tree.root
                    };
                }
            }
            (this._breadcrumb || (this._breadcrumb = new Breadcrumb(this.group, bind(onSelect, this)))).render(seriesModel, api, targetInfo.node);
            function onSelect(node) {
                this._zoomToNode({
                    node: node
                });
            }
        },
        remove: function() {
            this._clearController();
            this._containerGroup && this._containerGroup.removeAll();
            this._storage = createStorage();
            this._state = "ready";
            this._breadcrumb && this._breadcrumb.remove();
        },
        dispose: function() {
            this._clearController();
        },
        _zoomToNode: function(targetInfo) {
            this.api.dispatchAction({
                type: "treemapZoomToNode",
                from: this.uid,
                seriesId: this.seriesModel.id,
                targetNode: targetInfo.node
            });
        },
        findTarget: function(x, y) {
            var targetInfo;
            var viewRoot = this.seriesModel.getViewRoot();
            viewRoot.eachNode({
                attr: "viewChildren",
                order: "preorder"
            }, function(node) {
                var bgEl = this._storage.background[node.getRawIndex()];
                if (bgEl) {
                    var point = bgEl.transformCoordToLocal(x, y);
                    var shape = bgEl.shape;
                    if (shape.x <= point[0] && point[0] <= shape.x + shape.width && shape.y <= point[1] && point[1] <= shape.y + shape.height) {
                        targetInfo = {
                            node: node,
                            offsetX: point[0],
                            offsetY: point[1]
                        };
                    } else {
                        return false;
                    }
                }
            }, this);
            return targetInfo;
        }
    });
    function createStorage() {
        return {
            nodeGroup: [],
            background: [],
            content: []
        };
    }
});