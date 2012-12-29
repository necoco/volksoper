/*! Volksoper - v0.1.0 - 2012-12-29
* http://PROJECT_WEBSITE/
* Copyright (c) 2012 tshinsay; Licensed MIT */

var volksoper;
(function (volksoper) {
    var Event = (function () {
        function Event(_type) {
            this._type = _type;
            this._propagates = true;
            this._stopImmediate = false;
        }
        Event.ADDED = "added";
        Event.REMOVE = "remove";
        Object.defineProperty(Event.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "propagates", {
            get: function () {
                return this._propagates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "stopImmediate", {
            get: function () {
                return this._stopImmediate;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.stopPropagation = function () {
            this._propagates = false;
        };
        Event.prototype.stopPropagationImmediate = function () {
            this._propagates = false;
            this._stopImmediate = true;
        };
        return Event;
    })();
    volksoper.Event = Event;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    volksoper.SYSTEM_PRIORITY = -100000000;
    var Actor = (function () {
        function Actor() {
        }
        Actor._handlerNameTable = {
        };
        Actor.prototype.addChild = function (child) {
            this._children = this._children || [];
            child._parent = this;
            this._children.push(child);
            child.propagateEvent(new volksoper.Event(volksoper.Event.ADDED));
        };
        Actor.prototype.removeChild = function (child) {
            if(!this._children) {
                return false;
            }
            var index = this._children.indexOf(child);
            if(index >= 0) {
                child.propagateEvent(new volksoper.Event(volksoper.Event.REMOVE));
                this._children.splice(index, 1);
                child._parent = null;
                return true;
            }
            return false;
        };
        Actor.prototype.popChild = function () {
            var top = this.topChild;
            if(!top) {
                return null;
            }
            top.propagateEvent(new volksoper.Event(volksoper.Event.REMOVE));
            this._children.pop();
            top._parent = null;
            return top;
        };
        Object.defineProperty(Actor.prototype, "topChild", {
            get: function () {
                if(!this._children || this._children.length == 0) {
                    return null;
                }
                return this._children[this._children.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Actor.prototype, "numChildren", {
            get: function () {
                if(!this._children) {
                    return 0;
                } else {
                    return this._children.length;
                }
            },
            enumerable: true,
            configurable: true
        });
        Actor.prototype.sortChildren = function (comparator) {
            this._children = this._children || [];
            this._children.sort(comparator);
        };
        Actor.prototype.getChild = function (index) {
            if(this._children == null) {
                return null;
            }
            return this._children[index];
        };
        Actor.prototype.addEventListener = function (type, listener, capture, priority) {
            if(capture) {
                this._captureHandlers = Actor._registerListener(this._captureHandlers, type, listener, priority);
            } else {
                this._bubbleHandlers = Actor._registerListener(this._bubbleHandlers, type, listener, priority);
            }
        };
        Actor.prototype.removeEventListener = function (type, listener, capture) {
            if(capture) {
                return Actor._removeHandler(this._captureHandlers, type, listener);
            } else {
                return Actor._removeHandler(this._bubbleHandlers, type, listener);
            }
        };
        Actor._removeHandler = function _removeHandler(map, type, listener) {
            if(!map) {
                return false;
            }
            var handlers = map[type];
            for(var index in handlers) {
                var handler = handlers[index].handler;
                if(handler === listener) {
                    handlers.splice(index, 1);
                    return true;
                }
            }
            return false;
        }
        Actor._registerListener = function _registerListener(map, type, handler, priority) {
            priority = priority || 0;
            map = map || {
            };
            if(!(type in map)) {
                map[type] = [];
            }
            map[type].push({
                priority: priority,
                handler: handler
            });
            map[type].sort(function (lhs, rhs) {
                return rhs.priority - lhs.priority;
            });
            return map;
        }
        Actor.prototype.dispatchEvent = function (event) {
            return this._handleEvent(event, this, false);
        };
        Actor.prototype.propagateEvent = function (event) {
            var result = false;
            var chain = [
                this
            ];
            var current = this;
            var n = 0;
            while((current = current._parent)) {
                chain.push(current);
            }
            var len = chain.length;
            for(n = len - 1; n >= 0; n--) {
                result = (chain[n])._handleEvent(event, this, true) || result;
                if(!event.propagates) {
                    return result;
                }
            }
            for(n = 0; n < len; n++) {
                result = (chain[n])._handleEvent(event, this, false) || result;
                if(!event.propagates) {
                    return result;
                }
            }
            return result;
        };
        Actor.prototype.broadcastEvent = function (event) {
            var result = false;
            result = this._handleEvent(event, null, false) || result;
            if(this._children) {
                for(var n = 0; n < this._children.length; ++n) {
                    result = (this._children[n]).broadcastEvent(event) || result;
                }
            }
            return result;
        };
        Actor.prototype._handleEvent = function (event, target, capture) {
            event.currentTarget = this;
            event.target = target;
            if(!capture && this._callHandler(event) && event.stopImmediate) {
                return true;
            }
            var type = event.type;
            var handlers;
            if(capture && this._captureHandlers) {
                handlers = this._captureHandlers[type];
            } else {
                if(!capture && this._bubbleHandlers) {
                    handlers = this._bubbleHandlers[type];
                }
            }
            if(!handlers || handlers.length == 0) {
                return false;
            }
            for(var index in handlers) {
                var handler = handlers[index].handler;
                event.currentTarget = this;
                event.target = target;
                handler(event);
                if(event.stopImmediate) {
                    break;
                }
            }
            return true;
        };
        Actor.prototype._callHandler = function (event) {
            var handlerName = Actor._handlerNameTable[event.type] || Actor._getHandlerName(event);
            if(this[handlerName]) {
                this[handlerName](event);
                return true;
            }
            return false;
        };
        Actor._getHandlerName = function _getHandlerName(event) {
            var type = event.type;
            var name = "on" + type.charAt(0).toUpperCase() + type.substr(1);
            Actor._handlerNameTable[type] = name;
            return name;
        }
        return Actor;
    })();
    volksoper.Actor = Actor;    
})(volksoper || (volksoper = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var volksoper;
(function (volksoper) {
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene() {
                _super.call(this);
            this._wrapper = {
            };
            this._registry = {
            };
            var self = this;
            this.addEventListener(volksoper.Event.ADDED, function (e) {
                self._registerTarget(e.target);
            }, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, function (e) {
                self._unregisterTarget(e.target);
            }, true);
        }
        Scene.prototype._registerTarget = function (target) {
            this._getTable(target).push(target);
            this._registerWrapper(target);
        };
        Scene.prototype._registerWrapper = function (target) {
            var wrapper = this._wrapper[target.prototype.constructor];
            var table = this._getTable(target);
            if(!wrapper) {
                wrapper = Scene._createWrapper(target, table);
                this._wrapper[target.prototype.constructor] = wrapper;
            }
        };
        Scene._createWrapper = function _createWrapper(target, table) {
            var wrapper = {
            };
            for(var key in target) {
                var body = target[key];
                if(typeof body === 'function') {
                    wrapper[key] = Scene._wrapMethod(table, key, wrapper);
                }
            }
            return wrapper;
        }
        Scene._wrapMethod = function _wrapMethod(table, key, wrapper) {
            return function () {
                for(var index in table) {
                    table[index][key].apply(table[index], arguments);
                }
                return wrapper;
            }
        }
        Scene.prototype._getTable = function (target) {
            var table = this._registry[target.prototype.constructor];
            if(!table) {
                this._registry[target.prototype.constructor] = table = [];
            }
            return table;
        };
        Scene.prototype._unregisterTarget = function (target) {
            var table = this._getTable(target);
            table.splice(table.indexOf(target), 1);
        };
        Scene.prototype.find = function (targetClass) {
            return this._registry[targetClass] = this._registry[targetClass] || [];
        };
        Scene.prototype.query = function (targetClass) {
            return this._wrapper[targetClass];
        };
        return Scene;
    })(volksoper.Actor);
    volksoper.Scene = Scene;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Story = (function () {
        function Story() { }
        Story.prototype.wait = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return this;
        };
        Story.prototype.then = function (fn) {
            return this;
        };
        Story.prototype.waitEvent = function (name, source) {
            return this;
        };
        Story.prototype.tween = function (obj) {
            return this;
        };
        Story.prototype.tweenBy = function (obj) {
            return this;
        };
        Story.prototype.call = function (methodName) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            return this;
        };
        Object.defineProperty(Story.prototype, "and", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        return Story;
    })();
    volksoper.Story = Story;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var StoryBoard = (function () {
        function StoryBoard(type) {
        }
        StoryBoard.UPDATE_TICK = "tick";
        StoryBoard.UPDATE_TIME = "time";
        StoryBoard.prototype.update = function (time) {
        };
        StoryBoard.prototype.story = function (hero) {
            return null;
        };
        Object.defineProperty(StoryBoard.prototype, "numStories", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        return StoryBoard;
    })();
    volksoper.StoryBoard = StoryBoard;    
})(volksoper || (volksoper = {}));
