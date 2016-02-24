define("crm-modules/common/echarts/util/quickSelect", [], function(require, exports, module) {
    function defaultCompareFunc(a, b) {
        return a - b;
    }
    function swapElement(list, idx0, idx1) {
        var tmp = list[idx0];
        list[idx0] = list[idx1];
        list[idx1] = tmp;
    }
    function select(list, left, right, nth, compareFunc) {
        var pivotIdx = left;
        while (right > left) {
            pivotIdx = Math.round((right + left) / 2);
            var pivotValue = list[pivotIdx];
            swapElement(list, pivotIdx, right);
            pivotIdx = left;
            for (var i = left; i <= right - 1; i++) {
                if (compareFunc(pivotValue, list[i]) >= 0) {
                    swapElement(list, i, pivotIdx);
                    pivotIdx++;
                }
            }
            swapElement(list, right, pivotIdx);
            if (pivotIdx === nth) {
                return pivotIdx;
            } else if (pivotIdx < nth) {
                left = pivotIdx + 1;
            } else {
                right = pivotIdx - 1;
            }
        }
        return left;
    }
    function quickSelect(list, left, right, nth, compareFunc) {
        if (arguments.length <= 3) {
            nth = left;
            if (arguments.length == 2) {
                compareFunc = defaultCompareFunc;
            } else {
                compareFunc = right;
            }
            left = 0;
            right = list.length - 1;
        }
        return select(list, left, right, nth, compareFunc);
    }
    return quickSelect;
});