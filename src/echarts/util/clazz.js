define("crm-modules/common/echarts/util/clazz", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var clazz = {};
    var TYPE_DELIMITER = ".";
    var IS_CONTAINER = "___EC__COMPONENT__CONTAINER___";
    var parseClassType = clazz.parseClassType = function(componentType) {
        var ret = {
            main: "",
            sub: ""
        };
        if (componentType) {
            componentType = componentType.split(TYPE_DELIMITER);
            ret.main = componentType[0] || "";
            ret.sub = componentType[1] || "";
        }
        return ret;
    };
    clazz.enableClassExtend = function(RootClass, preConstruct) {
        RootClass.extend = function(proto) {
            var ExtendedClass = function() {
                preConstruct && preConstruct.apply(this, arguments);
                RootClass.apply(this, arguments);
            };
            zrUtil.extend(ExtendedClass.prototype, zrUtil.extend({
                $superCall: function(methodName) {
                    var args = zrUtil.slice(arguments, 1);
                    return findSuperMethod(this, methodName).apply(this, args);
                },
                $superApply: function(methodName, args) {
                    return findSuperMethod(this, methodName).apply(this, args);
                }
            }, proto));
            ExtendedClass.extend = this.extend;
            zrUtil.inherits(ExtendedClass, this);
            ExtendedClass.$superClass = this;
            return ExtendedClass;
        };
    };
    function findSuperMethod(context, methodName) {
        var SuperClass = context.constructor;
        var thisMethod = context[methodName];
        var method;
        while ((SuperClass = SuperClass.$superClass) && (method = SuperClass.prototype[methodName]) && method === thisMethod) {}
        return method;
    }
    clazz.enableClassManagement = function(entity, options) {
        options = options || {};
        var storage = {};
        entity.registerClass = function(Clazz, componentType) {
            if (componentType) {
                componentType = parseClassType(componentType);
                if (!componentType.sub) {
                    if (storage[componentType.main]) {
                        throw new Error(componentType.main + "exists");
                    }
                    storage[componentType.main] = Clazz;
                } else if (componentType.sub !== IS_CONTAINER) {
                    var container = makeContainer(componentType);
                    container[componentType.sub] = Clazz;
                }
            }
            return Clazz;
        };
        entity.getClass = function(componentTypeMain, subType, throwWhenNotFound) {
            var Clazz = storage[componentTypeMain];
            if (Clazz && Clazz[IS_CONTAINER]) {
                Clazz = subType ? Clazz[subType] : null;
            }
            if (throwWhenNotFound && !Clazz) {
                throw new Error("Component " + componentTypeMain + "." + (subType || "") + " not exists");
            }
            return Clazz;
        };
        entity.getClassesByMainType = function(componentType) {
            componentType = parseClassType(componentType);
            var result = [];
            var obj = storage[componentType.main];
            if (obj && obj[IS_CONTAINER]) {
                zrUtil.each(obj, function(o, type) {
                    type !== IS_CONTAINER && result.push(o);
                });
            } else {
                result.push(obj);
            }
            return result;
        };
        entity.hasClass = function(componentType) {
            componentType = parseClassType(componentType);
            return !!storage[componentType.main];
        };
        entity.getAllClassMainTypes = function() {
            var types = [];
            zrUtil.each(storage, function(obj, type) {
                types.push(type);
            });
            return types;
        };
        entity.hasSubTypes = function(componentType) {
            componentType = parseClassType(componentType);
            var obj = storage[componentType.main];
            return obj && obj[IS_CONTAINER];
        };
        entity.parseClassType = parseClassType;
        function makeContainer(componentType) {
            var container = storage[componentType.main];
            if (!container || !container[IS_CONTAINER]) {
                container = storage[componentType.main] = {};
                container[IS_CONTAINER] = true;
            }
            return container;
        }
        if (options.registerWhenExtend) {
            var originalExtend = entity.extend;
            if (originalExtend) {
                entity.extend = function(proto) {
                    var ExtendedClass = originalExtend.call(this, proto);
                    return entity.registerClass(ExtendedClass, proto.type);
                };
            }
        }
        return entity;
    };
    clazz.setReadOnly = function(obj, properties) {};
    return clazz;
});