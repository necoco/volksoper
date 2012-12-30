/*! Volksoper - v0.1.0 - 2012-12-30
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
        Event.ADDED_TO_SCENE = "addedToScene";
        Event.REMOVE_FROM_SCENE = "removeFromScene";
        Event.ADDED_TO_STAGE = "addedToStage";
        Event.REMOVE_FROM_STAGE = "removeFromScene";
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
    volksoper.SYSTEM_PRIORITY = 100000000;
    var Actor = (function () {
        function Actor() {
            this._forEach = 0;
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
            if(this._forEach !== 0) {
                this._toRemove = this._toRemove || [];
                this._toRemove.push(child);
                return true;
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
        Actor.prototype.swapTop = function (child) {
            var result = this.popChild();
            if(result) {
                this.addChild(child);
            }
            return result;
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
        Actor.prototype.broadcastEvent = function (event, target) {
            return this._broadcastEvent(event, (target) ? target : this);
        };
        Actor.prototype._broadcastEvent = function (event, target) {
            var result = false;
            result = this._handleEvent(event, target, false) || result;
            if(this._children) {
                this.forEachChild(function (child) {
                    result = child._broadcastEvent(event, target) || result;
                });
            }
            return result;
        };
        Actor.prototype.broadcast = function (name) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if(name in this) {
                this[name].call(this, args);
            }
        };
        Actor.prototype.forEachChild = function (fn) {
            this._forEach++;
            if(this._children) {
                var len = this._children.length;
                for(var n = 0; n < len; ++n) {
                    fn(this._children[n]);
                }
            }
            this._forEach--;
            if(this._forEach === 0) {
                var r = this._toRemove;
                if(r) {
                    var rlen = r.length;
                    for(var m = 0; m < rlen; m++) {
                        this.removeChild(r[m]);
                    }
                    r.splice(0);
                }
            }
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
var volksoper;
(function (volksoper) {
    (function (Easing) {
        function LINEAR(t) {
            return t;
        }
        Easing.LINEAR = LINEAR;
    })(volksoper.Easing || (volksoper.Easing = {}));
    var Easing = volksoper.Easing;
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    function CompositeScenario(callback) {
        var scenarios = [];
        return function (timer, scenario) {
            if(scenario) {
                scenarios.push(scenario);
                return false;
            }
            while(scenarios.length != 0) {
                if(scenarios[0](timer)) {
                    return true;
                } else {
                    scenarios.shift();
                }
            }
            if(callback) {
                callback();
            }
            return false;
        }
    }
    function WaitFunc(fn) {
        return function () {
            fn();
        }
    }
    function ParallelScenario() {
        var scenarios = [];
        return function (timer, scenario) {
            if(scenario) {
                scenarios.push(scenario);
                return false;
            }
            for(var n = 0; n < scenarios.length; ++n) {
                if(!scenarios[n](timer)) {
                    scenarios.splice(n, 1);
                    n -= 1;
                }
            }
            return scenarios.length !== 0;
        }
    }
    function WaitEvent(event, source) {
        var called = false;
        var listener = function (ev) {
            source.removeEventListener(event, listener);
            called = true;
        };
        source.addEventListener(event, listener);
        return function () {
            return !called;
        }
    }
    function Tween(target, dst, time, easing) {
        var src = {
        };
        var currentTime = 0;
        for(var key in dst) {
            src[key] = target[key];
        }
        return function (timer) {
            var consumed = timer.consume(time - currentTime);
            var key = null;
            if(consumed >= 0) {
                currentTime += consumed;
                for(key in dst) {
                    var t = easing(currentTime / time);
                    target[key] = (1 - t) * src[key] + t * dst[key];
                }
                return true;
            } else {
                for(key in dst) {
                    target[key] = dst[key];
                }
                return false;
            }
        }
    }
    function Then(fn) {
        return function () {
            fn();
            return false;
        }
    }
    var Story = (function () {
        function Story(_board, _hero) {
            this._board = _board;
            this._hero = _hero;
            this._state = "normal";
        }
        Story.prototype._createScenario = function () {
            if(!this._scenario) {
                this._board._registerStory(this);
                var self = this;
                this._scenario = CompositeScenario(function () {
                    self._scenario = null;
                    self._board._unregisterStory(self);
                });
            }
        };
        Story.prototype._addScenario = function (s) {
            this._createScenario();
            switch(this._state) {
                case "normal": {
                    this._scenario(null, s);
                    break;

                }
                case "and": {
                    this._and(null, s);
                    this._state = "unknown";
                    break;

                }
                case "unknown": {
                    this._scenario(null, s);
                    this._state = "normal";
                    break;

                }
            }
        };
        Story.prototype.wait = function () {
            var scenario = ParallelScenario();
            for(var n = 0; n < arguments.length; ++n) {
                var b = arguments[n];
                if(typeof b === 'string') {
                    scenario(null, WaitEvent(b, this._hero));
                } else {
                    if(b instanceof volksoper.Story) {
                        scenario(null, b._scenario);
                    } else {
                        scenario(null, WaitFunc(b));
                    }
                }
            }
            this._addScenario(scenario);
            return this;
        };
        Story.prototype.then = function (fn) {
            this._addScenario(Then(fn));
            return this;
        };
        Story.prototype.waitEvent = function (name, source) {
            this._addScenario(WaitEvent(name, source));
            return this;
        };
        Story.prototype._createTween = function (dstManip, target, args) {
            var easing;
            var dst;
            var time;
            if(args.length == 1) {
                var obj = args[0];
                easing = obj.easing || volksoper.Easing.LINEAR;
                delete obj.easing;
                time = obj.time || 1;
                delete obj.time;
                dst = obj;
            } else {
                easing = args[2] || volksoper.Easing.LINEAR;
                dst = {
                };
                dst[args[0]] = args[1];
            }
            if(dstManip) {
                dst = dstManip(dst);
            }
            this._addScenario(Tween(target, dst, time, easing));
        };
        Story.prototype.tween = function (obj) {
            this._createTween(null, this._hero, arguments);
            return this;
        };
        Story.prototype.tweenBy = function (obj) {
            this._createScenario();
            var hero = this._hero;
            this._createTween(function (o) {
                for(var key in o) {
                    o[key] = o[key] + hero[key];
                }
                return o;
            }, hero, arguments);
            return this;
        };
        Story.prototype.call = function (methodName) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            this._createScenario();
            var hero = this._hero;
            this._addScenario(function () {
                hero[methodName].apply(hero, args);
                return false;
            });
            return this;
        };
        Object.defineProperty(Story.prototype, "and", {
            get: function () {
                switch(this._state) {
                    case "normal": {
                        this._and = CompositeScenario(null);
                        break;

                    }
                    case "and": {
                        break;

                    }
                    case "unknown": {
                        this._state = "and";
                        break;

                    }
                }
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Story.prototype._update = function (timer) {
            this._scenario(timer);
        };
        return Story;
    })();
    volksoper.Story = Story;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var StoryTimer = (function () {
        function StoryTimer() {
            this._time = 0;
        }
        StoryTimer.prototype.setTime = function (time) {
            this._time = time;
        };
        StoryTimer.prototype.consume = function (time) {
            if(this._time < time) {
                this._time = 0;
                return this._time - time;
            }
            this._time -= time;
            return -1;
        };
        return StoryTimer;
    })();    
    var StoryBoard = (function () {
        function StoryBoard() {
            this._stories = [];
            this._timer = new StoryTimer();
            this._unregister = [];
        }
        StoryBoard.prototype.update = function (time) {
            this._unregister.splice(0);
            this._timer.setTime(time);
            for(var n = 0; n < this._stories.length; n++) {
                this._stories[n]._update(this._timer);
            }
            for(var n = 0; n < this._unregister.length; ++n) {
                this._stories.splice(this._stories.indexOf(this._unregister[n]), 1);
            }
            return this._stories.length == 0;
        };
        StoryBoard.prototype._registerStory = function (story) {
            var index = this._unregister.indexOf(story);
            if(index >= 0) {
                this._unregister.splice(index, 0);
            } else {
                this._stories.push(story);
            }
        };
        StoryBoard.prototype._unregisterStory = function (story) {
            this._unregister.push(story);
        };
        StoryBoard.prototype.story = function (hero) {
            return new volksoper.Story(this, hero);
        };
        Object.defineProperty(StoryBoard.prototype, "numStories", {
            get: function () {
                return this._stories.length;
            },
            enumerable: true,
            configurable: true
        });
        return StoryBoard;
    })();
    volksoper.StoryBoard = StoryBoard;    
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
            this._registry = {
            };
            this._execFind = 0;
            this._unregister = [];
            this._board = new volksoper.StoryBoard();
            var self = this;
            var addedListener = function (e) {
                self._registerTarget(e.target);
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.ADDED_TO_SCENE), self);
            };
            var removeListener = function (e) {
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.REMOVE_FROM_SCENE), self);
                self._unregisterTarget(e.target);
            };
            this.addEventListener(volksoper.Event.ADDED, addedListener, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, removeListener, true, volksoper.SYSTEM_PRIORITY);
        }
        Object.defineProperty(Scene.prototype, "storyBoard", {
            get: function () {
                return this._board;
            },
            enumerable: true,
            configurable: true
        });
        Scene.prototype._registerTarget = function (target) {
            this._iterateTable(target, function (a) {
                a.push(target);
            });
        };
        Scene.prototype._iterateTable = function (target, fn) {
            var group = target.constructor.group;
            if(typeof group === 'string') {
                this._callbackGroup(group, fn);
            } else {
                if(group instanceof Array) {
                    for(var n = 0; n < group.length; ++n) {
                        this._callbackGroup(group[n], fn);
                    }
                }
            }
        };
        Scene.prototype._callbackGroup = function (group, fn) {
            var table = this._registry[group];
            if(!table) {
                this._registry[group] = table = [];
            }
            fn(table);
        };
        Scene.prototype._unregisterTarget = function (target) {
            var _this = this;
            if(this._execFind === 0) {
                this._iterateTable(target, function (table) {
                    console.log(table.indexOf(target));
                    table.splice(table.indexOf(target), 1);
                });
            } else {
                this._iterateTable(target, function (table) {
                    _this._unregister = [
                        table, 
                        target
                    ];
                });
            }
        };
        Scene.prototype.find = function (groupName, callback) {
            this._execFind++;
            this._callbackGroup(groupName, function (a) {
                var len = a.length;
                for(var n = 0; n < len; ++n) {
                    callback(a[n]);
                }
            });
            this._execFind--;
            if(this._execFind === 0) {
                var r = this._unregister;
                var len = r.length;
                for(var n = 0; n < len; ++n) {
                    r[n][0].splice(r[n][0].indexOf(r[n][1]), 1);
                }
                r.splice(0);
            }
        };
        return Scene;
    })(volksoper.Actor);
    volksoper.Scene = Scene;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
                _super.call(this);
            this.alpha = 1;
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.width = 0;
            this.height = 0;
            this.rotation = 0;
            this.rotationX = 0;
            this.rotationY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.visible = true;
            var self = this;
            this.addEventListener(volksoper.Event.ADDED_TO_SCENE, function (e) {
                self._scene = e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_SCENE, function (e) {
                self._scene = null;
            });
            this.addEventListener(volksoper.Event.ADDED_TO_STAGE, function (e) {
                self._stage = e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_STAGE, function (e) {
                self._stage = null;
            });
        }
        Object.defineProperty(Sprite.prototype, "scene", {
            get: function () {
                return this._scene;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "stage", {
            get: function () {
                return this._stage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "story", {
            get: function () {
                if(this._story) {
                    return this._story;
                }
                this._story = this._scene.storyBoard.story(this);
                return this._story;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "surface", {
            get: function () {
                return this._surface;
            },
            set: function (surface) {
                if(this._surface) {
                    this._surface.release();
                }
                this._surface = surface;
                surface.addRef();
            },
            enumerable: true,
            configurable: true
        });
        return Sprite;
    })(volksoper.Actor);
    volksoper.Sprite = Sprite;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Stage = (function (_super) {
        __extends(Stage, _super);
        function Stage() {
                _super.call(this);
            var self = this;
            var addedListener = function (e) {
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.ADDED_TO_STAGE), self);
            };
            var removeListener = function (e) {
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.REMOVE_FROM_STAGE), self);
            };
            this.addEventListener(volksoper.Event.ADDED, addedListener, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, removeListener, true, volksoper.SYSTEM_PRIORITY);
        }
        return Stage;
    })(volksoper.Sprite);
    volksoper.Stage = Stage;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Surface = (function () {
        function Surface() {
            this._referenceCount = 0;
        }
        Surface.prototype.invalidate = function () {
        };
        Surface.prototype.addRef = function () {
            return ++this._referenceCount;
        };
        Surface.prototype.release = function () {
            return --this._referenceCount;
        };
        Surface.prototype.count = function () {
            return this._referenceCount;
        };
        return Surface;
    })();
    volksoper.Surface = Surface;    
})(volksoper || (volksoper = {}));
