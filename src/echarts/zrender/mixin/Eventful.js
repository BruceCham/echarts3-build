define("crm-modules/common/echarts/zrender/mixin/Eventful", [ "../core/util" ], function(require, exports, module) {
    var arrySlice = Array.prototype.slice;
    var zrUtil = require("../core/util");
    var indexOf = zrUtil.indexOf;
    var Eventful = function() {
        this._$handlers = {};
    };
    Eventful.prototype = {
        constructor: Eventful,
        one: function(event, handler, context) {
            var _h = this._$handlers;
            if (!handler || !event) {
                return this;
            }
            if (!_h[event]) {
                _h[event] = [];
            }
            if (indexOf(_h[event], event) >= 0) {
                return this;
            }
            _h[event].push({
                h: handler,
                one: true,
                ctx: context || this
            });
            return this;
        },
        on: function(event, handler, context) {
            var _h = this._$handlers;
            if (!handler || !event) {
                return this;
            }
            if (!_h[event]) {
                _h[event] = [];
            }
            _h[event].push({
                h: handler,
                one: false,
                ctx: context || this
            });
            return this;
        },
        isSilent: function(event) {
            var _h = this._$handlers;
            return _h[event] && _h[event].length;
        },
        off: function(event, handler) {
            var _h = this._$handlers;
            if (!event) {
                this._$handlers = {};
                return this;
            }
            if (handler) {
                if (_h[event]) {
                    var newList = [];
                    for (var i = 0, l = _h[event].length; i < l; i++) {
                        if (_h[event][i]["h"] != handler) {
                            newList.push(_h[event][i]);
                        }
                    }
                    _h[event] = newList;
                }
                if (_h[event] && _h[event].length === 0) {
                    delete _h[event];
                }
            } else {
                delete _h[event];
            }
            return this;
        },
        trigger: function(type) {
            if (this._$handlers[type]) {
                var args = arguments;
                var argLen = args.length;
                if (argLen > 3) {
                    args = arrySlice.call(args, 1);
                }
                var _h = this._$handlers[type];
                var len = _h.length;
                for (var i = 0; i < len; ) {
                    switch (argLen) {
                      case 1:
                        _h[i]["h"].call(_h[i]["ctx"]);
                        break;

                      case 2:
                        _h[i]["h"].call(_h[i]["ctx"], args[1]);
                        break;

                      case 3:
                        _h[i]["h"].call(_h[i]["ctx"], args[1], args[2]);
                        break;

                      default:
                        _h[i]["h"].apply(_h[i]["ctx"], args);
                        break;
                    }
                    if (_h[i]["one"]) {
                        _h.splice(i, 1);
                        len--;
                    } else {
                        i++;
                    }
                }
            }
            return this;
        },
        triggerWithContext: function(type) {
            if (this._$handlers[type]) {
                var args = arguments;
                var argLen = args.length;
                if (argLen > 4) {
                    args = arrySlice.call(args, 1, args.length - 1);
                }
                var ctx = args[args.length - 1];
                var _h = this._$handlers[type];
                var len = _h.length;
                for (var i = 0; i < len; ) {
                    switch (argLen) {
                      case 1:
                        _h[i]["h"].call(ctx);
                        break;

                      case 2:
                        _h[i]["h"].call(ctx, args[1]);
                        break;

                      case 3:
                        _h[i]["h"].call(ctx, args[1], args[2]);
                        break;

                      default:
                        _h[i]["h"].apply(ctx, args);
                        break;
                    }
                    if (_h[i]["one"]) {
                        _h.splice(i, 1);
                        len--;
                    } else {
                        i++;
                    }
                }
            }
            return this;
        }
    };
    return Eventful;
});