define("crm-modules/common/echarts/data/Graph", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    "use strict";
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var Graph = function(directed) {
        this._directed = directed || false;
        this.nodes = [];
        this.edges = [];
        this._nodesMap = {};
        this._edgesMap = {};
        this.data;
        this.edgeData;
    };
    var graphProto = Graph.prototype;
    graphProto.type = "graph";
    graphProto.isDirected = function() {
        return this._directed;
    };
    graphProto.addNode = function(id, dataIndex) {
        var nodesMap = this._nodesMap;
        if (nodesMap[id]) {
            return;
        }
        var node = new Node(id, dataIndex);
        node.hostGraph = this;
        this.nodes.push(node);
        nodesMap[id] = node;
        return node;
    };
    graphProto.getNodeByIndex = function(dataIndex) {
        var rawIdx = this.data.getRawIndex(dataIndex);
        return this.nodes[rawIdx];
    };
    graphProto.getNodeById = function(id) {
        return this._nodesMap[id];
    };
    graphProto.addEdge = function(n1, n2, dataIndex) {
        var nodesMap = this._nodesMap;
        var edgesMap = this._edgesMap;
        if (!(n1 instanceof Node)) {
            n1 = nodesMap[n1];
        }
        if (!(n2 instanceof Node)) {
            n2 = nodesMap[n2];
        }
        if (!n1 || !n2) {
            return;
        }
        var key = n1.id + "-" + n2.id;
        if (edgesMap[key]) {
            return;
        }
        var edge = new Edge(n1, n2, dataIndex);
        edge.hostGraph = this;
        if (this._directed) {
            n1.outEdges.push(edge);
            n2.inEdges.push(edge);
        }
        n1.edges.push(edge);
        if (n1 !== n2) {
            n2.edges.push(edge);
        }
        this.edges.push(edge);
        edgesMap[key] = edge;
        return edge;
    };
    graphProto.getEdgeByIndex = function(dataIndex) {
        var rawIdx = this.edgeData.getRawIndex(dataIndex);
        return this.edges[rawIdx];
    };
    graphProto.getEdge = function(n1, n2) {
        if (n1 instanceof Node) {
            n1 = n1.id;
        }
        if (n2 instanceof Node) {
            n2 = n2.id;
        }
        var edgesMap = this._edgesMap;
        if (this._directed) {
            return edgesMap[n1 + "-" + n2];
        } else {
            return edgesMap[n1 + "-" + n2] || edgesMap[n2 + "-" + n1];
        }
    };
    graphProto.eachNode = function(cb, context) {
        var nodes = this.nodes;
        var len = nodes.length;
        for (var i = 0; i < len; i++) {
            if (nodes[i].dataIndex >= 0) {
                cb.call(context, nodes[i], i);
            }
        }
    };
    graphProto.eachEdge = function(cb, context) {
        var edges = this.edges;
        var len = edges.length;
        for (var i = 0; i < len; i++) {
            if (edges[i].dataIndex >= 0 && edges[i].node1.dataIndex >= 0 && edges[i].node2.dataIndex >= 0) {
                cb.call(context, edges[i], i);
            }
        }
    };
    graphProto.breadthFirstTraverse = function(cb, startNode, direction, context) {
        if (!startNode instanceof Node) {
            startNode = this._nodesMap[startNode];
        }
        if (!startNode) {
            return;
        }
        var edgeType = direction === "out" ? "outEdges" : direction === "in" ? "inEdges" : "edges";
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].__visited = false;
        }
        if (cb.call(context, startNode, null)) {
            return;
        }
        var queue = [ startNode ];
        while (queue.length) {
            var currentNode = queue.shift();
            var edges = currentNode[edgeType];
            for (var i = 0; i < edges.length; i++) {
                var e = edges[i];
                var otherNode = e.node1 === currentNode ? e.node2 : e.node1;
                if (!otherNode.__visited) {
                    if (cb.call(otherNode, otherNode, currentNode)) {
                        return;
                    }
                    queue.push(otherNode);
                    otherNode.__visited = true;
                }
            }
        }
    };
    graphProto.update = function() {
        var data = this.data;
        var edgeData = this.edgeData;
        var nodes = this.nodes;
        var edges = this.edges;
        for (var i = 0, len = nodes.length; i < len; i++) {
            nodes[i].dataIndex = -1;
        }
        for (var i = 0, len = data.count(); i < len; i++) {
            nodes[data.getRawIndex(i)].dataIndex = i;
        }
        edgeData.filterSelf(function(idx) {
            var edge = edges[edgeData.getRawIndex(idx)];
            return edge.node1.dataIndex >= 0 && edge.node2.dataIndex >= 0;
        });
        for (var i = 0, len = edges.length; i < len; i++) {
            edges[i].dataIndex = -1;
        }
        for (var i = 0, len = edgeData.count(); i < len; i++) {
            edges[edgeData.getRawIndex(i)].dataIndex = i;
        }
    };
    graphProto.setEdgeData = function(edgeData) {
        this.edgeData = edgeData;
        this._edgeDataSaved = edgeData.cloneShallow();
    };
    graphProto.restoreData = function() {
        this.edgeData = this._edgeDataSaved.cloneShallow();
    };
    graphProto.clone = function() {
        var graph = new Graph(this._directed);
        var nodes = this.nodes;
        var edges = this.edges;
        for (var i = 0; i < nodes.length; i++) {
            graph.addNode(nodes[i].id, nodes[i].dataIndex);
        }
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            graph.addEdge(e.node1.id, e.node2.id, e.dataIndex);
        }
        return graph;
    };
    function Node(id, dataIndex) {
        this.id = id == null ? "" : id;
        this.inEdges = [];
        this.outEdges = [];
        this.edges = [];
        this.hostGraph;
        this.dataIndex = dataIndex == null ? -1 : dataIndex;
    }
    Node.prototype = {
        constructor: Node,
        degree: function() {
            return this.edges.length;
        },
        inDegree: function() {
            return this.inEdges.length;
        },
        outDegree: function() {
            return this.outEdges.length;
        },
        getModel: function(path) {
            if (this.dataIndex < 0) {
                return;
            }
            var graph = this.hostGraph;
            var itemModel = graph.data.getItemModel(this.dataIndex);
            return itemModel.getModel(path);
        }
    };
    function Edge(n1, n2, dataIndex) {
        this.node1 = n1;
        this.node2 = n2;
        this.dataIndex = dataIndex == null ? -1 : dataIndex;
    }
    Edge.prototype.getModel = function(path) {
        if (this.dataIndex < 0) {
            return;
        }
        var graph = this.hostGraph;
        var itemModel = graph.edgeData.getItemModel(this.dataIndex);
        return itemModel.getModel(path);
    };
    var createGraphDataProxyMixin = function(hostName, dataName) {
        return {
            getValue: function(dimension) {
                var data = this[hostName][dataName];
                return data.get(data.getDimension(dimension || "value"), this.dataIndex);
            },
            setVisual: function(key, value) {
                this.dataIndex >= 0 && this[hostName][dataName].setItemVisual(this.dataIndex, key, value);
            },
            getVisual: function(key, ignoreParent) {
                return this[hostName][dataName].getItemVisual(this.dataIndex, key, ignoreParent);
            },
            setLayout: function(layout, merge) {
                this.dataIndex >= 0 && this[hostName][dataName].setItemLayout(this.dataIndex, layout, merge);
            },
            getLayout: function() {
                return this[hostName][dataName].getItemLayout(this.dataIndex);
            },
            getGraphicEl: function() {
                return this[hostName][dataName].getItemGraphicEl(this.dataIndex);
            },
            getRawIndex: function() {
                return this[hostName][dataName].getRawIndex(this.dataIndex);
            }
        };
    };
    zrUtil.mixin(Node, createGraphDataProxyMixin("hostGraph", "data"));
    zrUtil.mixin(Edge, createGraphDataProxyMixin("hostGraph", "edgeData"));
    Graph.Node = Node;
    Graph.Edge = Edge;
    return Graph;
});