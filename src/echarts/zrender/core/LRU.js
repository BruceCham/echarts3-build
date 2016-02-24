define("crm-modules/common/echarts/zrender/core/LRU", [], function(require, exports, module) {
    var LinkedList = function() {
        this.head = null;
        this.tail = null;
        this._len = 0;
    };
    var linkedListProto = LinkedList.prototype;
    linkedListProto.insert = function(val) {
        var entry = new Entry(val);
        this.insertEntry(entry);
        return entry;
    };
    linkedListProto.insertEntry = function(entry) {
        if (!this.head) {
            this.head = this.tail = entry;
        } else {
            this.tail.next = entry;
            entry.prev = this.tail;
            this.tail = entry;
        }
        this._len++;
    };
    linkedListProto.remove = function(entry) {
        var prev = entry.prev;
        var next = entry.next;
        if (prev) {
            prev.next = next;
        } else {
            this.head = next;
        }
        if (next) {
            next.prev = prev;
        } else {
            this.tail = prev;
        }
        entry.next = entry.prev = null;
        this._len--;
    };
    linkedListProto.len = function() {
        return this._len;
    };
    var Entry = function(val) {
        this.value = val;
        this.next;
        this.prev;
    };
    var LRU = function(maxSize) {
        this._list = new LinkedList();
        this._map = {};
        this._maxSize = maxSize || 10;
    };
    var LRUProto = LRU.prototype;
    LRUProto.put = function(key, value) {
        var list = this._list;
        var map = this._map;
        if (map[key] == null) {
            var len = list.len();
            if (len >= this._maxSize && len > 0) {
                var leastUsedEntry = list.head;
                list.remove(leastUsedEntry);
                delete map[leastUsedEntry.key];
            }
            var entry = list.insert(value);
            entry.key = key;
            map[key] = entry;
        }
    };
    LRUProto.get = function(key) {
        var entry = this._map[key];
        var list = this._list;
        if (entry != null) {
            if (entry !== list.tail) {
                list.remove(entry);
                list.insertEntry(entry);
            }
            return entry.value;
        }
    };
    LRUProto.clear = function() {
        this._list.clear();
        this._map = {};
    };
    return LRU;
});