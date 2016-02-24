define("crm-modules/common/echarts/component/dataZoom/history", [ "crm-modules/common/echarts/zrender/core/util" ], function(require, exports, module) {
    var zrUtil = require("crm-modules/common/echarts/zrender/core/util");
    var each = zrUtil.each;
    var ATTR = "\0_ec_hist_store";
    var history = {
        push: function(ecModel, newSnapshot) {
            var store = giveStore(ecModel);
            each(newSnapshot, function(batchItem, dataZoomId) {
                var i = store.length - 1;
                for (;i >= 0; i--) {
                    var snapshot = store[i];
                    if (snapshot[dataZoomId]) {
                        break;
                    }
                }
                if (i < 0) {
                    var dataZoomModel = ecModel.queryComponents({
                        mainType: "dataZoom",
                        subType: "select",
                        id: dataZoomId
                    })[0];
                    if (dataZoomModel) {
                        var percentRange = dataZoomModel.getPercentRange();
                        store[0][dataZoomId] = {
                            dataZoomId: dataZoomId,
                            start: percentRange[0],
                            end: percentRange[1]
                        };
                    }
                }
            });
            store.push(newSnapshot);
        },
        pop: function(ecModel) {
            var store = giveStore(ecModel);
            var head = store[store.length - 1];
            store.length > 1 && store.pop();
            var snapshot = {};
            each(head, function(batchItem, dataZoomId) {
                for (var i = store.length - 1; i >= 0; i--) {
                    var batchItem = store[i][dataZoomId];
                    if (batchItem) {
                        snapshot[dataZoomId] = batchItem;
                        break;
                    }
                }
            });
            return snapshot;
        },
        clear: function(ecModel) {
            ecModel[ATTR] = null;
        },
        count: function(ecModel) {
            return giveStore(ecModel).length;
        }
    };
    function giveStore(ecModel) {
        var store = ecModel[ATTR];
        if (!store) {
            store = ecModel[ATTR] = [ {} ];
        }
        return store;
    }
    return history;
});