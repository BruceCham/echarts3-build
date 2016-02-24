define("crm-modules/common/echarts/model/Model", [ "crm-modules/common/echarts/zrender/core/util", "../util/clazz", "./mixin/lineStyle", "./mixin/areaStyle", "./mixin/textStyle", "./mixin/itemStyle" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var clazzUtil = require("../util/clazz");
    function Model(option, parentModel, ecModel, extraOpt) {
        this.parentModel = parentModel;
        this.ecModel = ecModel;
        this.option = option;
        if (this.init) {
            if (arguments.length <= 4) {
                this.init(option, parentModel, ecModel, extraOpt);
            } else {
                this.init.apply(this, arguments);
            }
        }
    }
    Model.prototype = {
        constructor: Model,
        init: null,
        mergeOption: function(option) {
            zrUtil.merge(this.option, option, true);
        },
        get: function(path, ignoreParent) {
            if (!path) {
                return this.option;
            }
            if (typeof path === "string") {
                path = path.split(".");
            }
            var obj = this.option;
            var parentModel = this.parentModel;
            for (var i = 0; i < path.length; i++) {
                obj = obj && typeof obj === "object" ? obj[path[i]] : null;
                if (obj == null) {
                    break;
                }
            }
            if (obj == null && parentModel && !ignoreParent) {
                obj = parentModel.get(path);
            }
            return obj;
        },
        getShallow: function(key, ignoreParent) {
            var option = this.option;
            var val = option && option[key];
            var parentModel = this.parentModel;
            if (val == null && parentModel && !ignoreParent) {
                val = parentModel.getShallow(key);
            }
            return val;
        },
        getModel: function(path, parentModel) {
            var obj = this.get(path, true);
            var thisParentModel = this.parentModel;
            var model = new Model(obj, parentModel || thisParentModel && thisParentModel.getModel(path), this.ecModel);
            return model;
        },
        isEmpty: function() {
            return this.option == null;
        },
        restoreData: function() {},
        clone: function() {
            var Ctor = this.constructor;
            return new Ctor(zrUtil.clone(this.option));
        },
        setReadOnly: function(properties) {
            clazzUtil.setReadOnly(this, properties);
        }
    };
    clazzUtil.enableClassExtend(Model);
    var mixin = zrUtil.mixin;
    mixin(Model, require("./mixin/lineStyle"));
    mixin(Model, require("./mixin/areaStyle"));
    mixin(Model, require("./mixin/textStyle"));
    mixin(Model, require("./mixin/itemStyle"));
    return Model;
});