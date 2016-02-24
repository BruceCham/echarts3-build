define("crm-modules/common/echarts/component/visualMap/preprocessor", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var each = zrUtil.each;
    return function(option) {
        var visualMap = option && option.visualMap;
        if (!zrUtil.isArray(visualMap)) {
            visualMap = visualMap ? [ visualMap ] : [];
        }
        each(visualMap, function(opt) {
            if (!opt) {
                return;
            }
            if (has(opt, "splitList") && !has(opt, "pieces")) {
                opt.pieces = opt.splitList;
                delete opt.splitList;
            }
            var pieces = opt.pieces;
            if (pieces && zrUtil.isArray(pieces)) {
                each(pieces, function(piece) {
                    if (zrUtil.isObject(piece)) {
                        if (has(piece, "start") && !has(piece, "min")) {
                            piece.min = piece.start;
                        }
                        if (has(piece, "end") && !has(piece, "max")) {
                            piece.max = piece.end;
                        }
                    }
                });
            }
        });
    };
    function has(obj, name) {
        return obj && obj.hasOwnProperty && obj.hasOwnProperty(name);
    }
});