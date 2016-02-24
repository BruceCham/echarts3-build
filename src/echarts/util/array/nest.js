define("crm-modules/common/echarts/util/array/nest", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    function nest() {
        var keysFunction = [];
        var sortKeysFunction = [];
        function map(array, depth) {
            if (depth >= keysFunction.length) {
                return array;
            }
            var i = -1;
            var n = array.length;
            var keyFunction = keysFunction[depth++];
            var mapObject = {};
            var valuesByKey = {};
            while (++i < n) {
                var keyValue = keyFunction(array[i]);
                var values = valuesByKey[keyValue];
                if (values) {
                    values.push(array[i]);
                } else {
                    valuesByKey[keyValue] = [ array[i] ];
                }
            }
            zrUtil.each(valuesByKey, function(value, key) {
                mapObject[key] = map(value, depth);
            });
            return mapObject;
        }
        function entriesMap(mapObject, depth) {
            if (depth >= keysFunction.length) {
                return mapObject;
            }
            var array = [];
            var sortKeyFunction = sortKeysFunction[depth++];
            zrUtil.each(mapObject, function(value, key) {
                array.push({
                    key: key,
                    values: entriesMap(value, depth)
                });
            });
            if (sortKeyFunction) {
                return array.sort(function(a, b) {
                    return sortKeyFunction(a.key, b.key);
                });
            } else {
                return array;
            }
        }
        return {
            key: function(d) {
                keysFunction.push(d);
                return this;
            },
            sortKeys: function(order) {
                sortKeysFunction[keysFunction.length - 1] = order;
                return this;
            },
            entries: function(array) {
                return entriesMap(map(array, 0), 0);
            }
        };
    }
    return nest;
});