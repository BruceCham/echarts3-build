define("crm-modules/common/echarts/coord/View", [ "crm-modules/common/echarts/zrender/core/vector", "crm-modules/common/echarts/zrender/core/matrix", "crm-modules/common/echarts/zrender/mixin/Transformable", "crm-modules/common/echarts/zrender/core/util", "crm-modules/common/echarts/zrender/core/BoundingRect" ], function(require, exports, module) {
    var vector = require("crm-modules/common/echarts/zrender/core/vector");
    var matrix = require("crm-modules/common/echarts/zrender/core/matrix");
    var Transformable = require("crm-modules/common/echarts/zrender/mixin/Transformable");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var BoundingRect = require("crm-modules/common/echarts/zrender/core/BoundingRect");
    var v2ApplyTransform = vector.applyTransform;
    function TransformDummy() {
        Transformable.call(this);
    }
    zrUtil.mixin(TransformDummy, Transformable);
    function View(name) {
        this.name = name;
        Transformable.call(this);
        this._roamTransform = new TransformDummy();
        this._viewTransform = new TransformDummy();
    }
    View.prototype = {
        constructor: View,
        type: "view",
        dimensions: [ "x", "y" ],
        setBoundingRect: function(x, y, width, height) {
            this._rect = new BoundingRect(x, y, width, height);
            return this._rect;
        },
        getBoundingRect: function() {
            return this._rect;
        },
        setViewRect: function(x, y, width, height) {
            this.transformTo(x, y, width, height);
            this._viewRect = new BoundingRect(x, y, width, height);
        },
        transformTo: function(x, y, width, height) {
            var rect = this.getBoundingRect();
            var viewTransform = this._viewTransform;
            viewTransform.transform = rect.calculateTransform(new BoundingRect(x, y, width, height));
            viewTransform.decomposeTransform();
            this._updateTransform();
        },
        setPan: function(x, y) {
            this._roamTransform.position = [ x, y ];
            this._updateTransform();
        },
        setZoom: function(zoom) {
            this._roamTransform.scale = [ zoom, zoom ];
            this._updateTransform();
        },
        getRoamTransform: function() {
            return this._roamTransform.transform;
        },
        _updateTransform: function() {
            var roamTransform = this._roamTransform;
            var viewTransform = this._viewTransform;
            viewTransform.parent = roamTransform;
            roamTransform.updateTransform();
            viewTransform.updateTransform();
            viewTransform.transform && matrix.copy(this.transform || (this.transform = []), viewTransform.transform);
            this.decomposeTransform();
        },
        getViewRect: function() {
            return this._viewRect;
        },
        dataToPoint: function(data) {
            var transform = this.transform;
            return transform ? v2ApplyTransform([], data, transform) : [ data[0], data[1] ];
        },
        pointToData: function(point) {
            var invTransform = this.invTransform;
            return invTransform ? v2ApplyTransform([], point, invTransform) : [ point[0], point[1] ];
        }
    };
    zrUtil.mixin(View, Transformable);
    return View;
});