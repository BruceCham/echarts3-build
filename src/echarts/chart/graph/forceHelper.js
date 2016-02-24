define("crm-modules/common/echarts/chart/graph/forceHelper", [ "crm-modules/common/echarts/zrender/core/vector" ], function(require, exports, module) {
    var vec2 = require("crm-modules/common/echarts/zrender/core/vector");
    var scaleAndAdd = vec2.scaleAndAdd;
    return function(nodes, edges, opts) {
        var rect = opts.rect;
        var width = rect.width;
        var height = rect.height;
        var center = [ rect.x + width / 2, rect.y + height / 2 ];
        var gravity = opts.gravity == null ? .1 : opts.gravity;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (!n.p) {
                n.p = vec2.create(width * (Math.random() - .5) + center[0], height * (Math.random() - .5) + center[1]);
            }
            n.pp = vec2.clone(n.p);
            n.edges = null;
        }
        var friction = .6;
        return {
            warmUp: function() {
                friction = .5;
            },
            setFixed: function(idx) {
                nodes[idx].fixed = true;
            },
            setUnfixed: function(idx) {
                nodes[idx].fixed = false;
            },
            step: function(cb) {
                var v12 = [];
                var nLen = nodes.length;
                for (var i = 0; i < edges.length; i++) {
                    var e = edges[i];
                    var n1 = e.n1;
                    var n2 = e.n2;
                    vec2.sub(v12, n2.p, n1.p);
                    var d = vec2.len(v12) - e.d;
                    var w = n2.w / (n1.w + n2.w);
                    vec2.normalize(v12, v12);
                    !n1.fixed && scaleAndAdd(n1.p, n1.p, v12, w * d * friction);
                    !n2.fixed && scaleAndAdd(n2.p, n2.p, v12, -(1 - w) * d * friction);
                }
                for (var i = 0; i < nLen; i++) {
                    var n = nodes[i];
                    if (!n.fixed) {
                        vec2.sub(v12, center, n.p);
                        vec2.scaleAndAdd(n.p, n.p, v12, gravity * friction);
                    }
                }
                for (var i = 0; i < nLen; i++) {
                    var n1 = nodes[i];
                    for (var j = i + 1; j < nLen; j++) {
                        var n2 = nodes[j];
                        vec2.sub(v12, n2.p, n1.p);
                        var d = vec2.len(v12);
                        if (d === 0) {
                            vec2.set(v12, Math.random() - .5, Math.random() - .5);
                            d = 1;
                        }
                        var repFact = (n1.rep + n2.rep) / d / d;
                        !n1.fixed && scaleAndAdd(n1.pp, n1.pp, v12, repFact);
                        !n2.fixed && scaleAndAdd(n2.pp, n2.pp, v12, -repFact);
                    }
                }
                var v = [];
                for (var i = 0; i < nLen; i++) {
                    var n = nodes[i];
                    if (!n.fixed) {
                        vec2.sub(v, n.p, n.pp);
                        vec2.scaleAndAdd(n.p, n.p, v, friction);
                        vec2.copy(n.pp, n.p);
                    }
                }
                friction = friction * .992;
                cb && cb(nodes, edges, friction < .01);
            }
        };
    };
});