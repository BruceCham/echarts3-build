define("crm-modules/common/echarts/model/Component", [ "./Model", "crm-modules/common/echarts/zrender/core/util", "../util/component", "../util/clazz", "../util/layout", "./mixin/boxLayout" ], function(require, exports, module) {
    var Model = require("./Model");
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var arrayPush = Array.prototype.push;
    var componentUtil = require("../util/component");
    var clazzUtil = require("../util/clazz");
    var layout = require("../util/layout");
    var ComponentModel = Model.extend({
        type: "component",
        id: "",
        name: "",
        mainType: "",
        subType: "",
        componentIndex: 0,
        defaultOption: null,
        ecModel: null,
        dependentModels: [],
        uid: null,
        layoutMode: null,
        init: function(option, parentModel, ecModel, extraOpt) {
            this.mergeDefaultAndTheme(this.option, this.ecModel);
        },
        mergeDefaultAndTheme: function(option, ecModel) {
            var layoutMode = this.layoutMode;
            var inputPositionParams = layoutMode ? layout.getLayoutParams(option) : {};
            var themeModel = ecModel.getTheme();
            zrUtil.merge(option, themeModel.get(this.mainType));
            zrUtil.merge(option, this.getDefaultOption());
            if (layoutMode) {
                layout.mergeLayoutParam(option, inputPositionParams, layoutMode);
            }
        },
        mergeOption: function(option) {
            zrUtil.merge(this.option, option, true);
            var layoutMode = this.layoutMode;
            if (layoutMode) {
                layout.mergeLayoutParam(this.option, option, layoutMode);
            }
        },
        getDefaultOption: function() {
            if (!this.hasOwnProperty("__defaultOption")) {
                var optList = [];
                var Class = this.constructor;
                while (Class) {
                    var opt = Class.prototype.defaultOption;
                    opt && optList.push(opt);
                    Class = Class.superClass;
                }
                var defaultOption = {};
                for (var i = optList.length - 1; i >= 0; i--) {
                    defaultOption = zrUtil.merge(defaultOption, optList[i], true);
                }
                this.__defaultOption = defaultOption;
            }
            return this.__defaultOption;
        }
    });
    clazzUtil.enableClassExtend(ComponentModel, function(option, parentModel, ecModel, extraOpt) {
        zrUtil.extend(this, extraOpt);
        this.uid = componentUtil.getUID("componentModel");
        this.setReadOnly([ "type", "id", "uid", "name", "mainType", "subType", "dependentModels", "componentIndex" ]);
    });
    clazzUtil.enableClassManagement(ComponentModel, {
        registerWhenExtend: true
    });
    componentUtil.enableSubTypeDefaulter(ComponentModel);
    componentUtil.enableTopologicalTravel(ComponentModel, getDependencies);
    function getDependencies(componentType) {
        var deps = [];
        zrUtil.each(ComponentModel.getClassesByMainType(componentType), function(Clazz) {
            arrayPush.apply(deps, Clazz.prototype.dependencies || []);
        });
        return zrUtil.map(deps, function(type) {
            return clazzUtil.parseClassType(type).main;
        });
    }
    zrUtil.mixin(ComponentModel, require("./mixin/boxLayout"));
    return ComponentModel;
});