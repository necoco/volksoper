/*! Volksoper - v0.1.0 - 2013-01-02
* http://PROJECT_WEBSITE/
* Copyright (c) 2013 tshinsay; Licensed MIT */

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
        Event.COMPLETE = "complete";
        Event.LOADED = "loaded";
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
        Object.defineProperty(Actor.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
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
            this.forEachChild(function (child) {
                result = child._broadcastEvent(event, target) || result;
            });
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
            this.forEachChild(function (child) {
                child.broadcast(name, args);
            });
        };
        Actor.prototype.forEachChild = function (fn, invert) {
            this._forEach++;
            if(this._children) {
                var len = this._children.length;
                var n = 0;
                if(invert) {
                    for(n = len - 1; n >= 0; --n) {
                        if(fn(this._children[n])) {
                            break;
                        }
                    }
                } else {
                    for(n = 0; n < len; ++n) {
                        if(fn(this._children[n])) {
                            break;
                        }
                    }
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
    var Vector3 = (function () {
        function Vector3(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        Vector3.prototype.normalize = function () {
            var len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            if(len === 0) {
                return false;
            }
            this.x /= len;
            this.y /= len;
            this.z /= len;
            return true;
        };
        Vector3.prototype.length = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        };
        Vector3.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Vector3.prototype.cross = function (a, b) {
            this.x = a.y * b.z - a.z * b.y;
            this.y = a.z * b.x - a.x * b.z;
            this.z = a.x * b.y - a.y * b.x;
            return this;
        };
        return Vector3;
    })();
    volksoper.Vector3 = Vector3;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Matrix4 = (function () {
        function Matrix4(m) {
            this.m = [
                1, 
                0, 
                0, 
                0, 
                0, 
                1, 
                0, 
                0, 
                0, 
                0, 
                1, 
                0, 
                0, 
                0, 
                0, 
                1
            ];
            if(m) {
                this.setValue(m);
            }
        }
        Matrix4.IDENT = [
            1, 
            0, 
            0, 
            0, 
            0, 
            1, 
            0, 
            0, 
            0, 
            0, 
            1, 
            0, 
            0, 
            0, 
            0, 
            1
        ];
        Matrix4.TMP = [
            1, 
            0, 
            0, 
            0, 
            0, 
            1, 
            0, 
            0, 
            0, 
            0, 
            1, 
            0, 
            0, 
            0, 
            0, 
            1
        ];
        Matrix4.TMP_MAT = new Matrix4();
        Matrix4.prototype.setValue = function (m) {
            var s = this.m;
            var d = m.m;
            for(var n = 0; n < 16; ++n) {
                s[n] = d[n];
            }
        };
        Matrix4.prototype.translate = function (x, y, z) {
            var m = this.m;
            m[12] += x;
            m[13] += y;
            m[14] += z;
            return this;
        };
        Matrix4.prototype.rotate = function (x, y, z) {
            var m = Matrix4.TMP_MAT.m;
            Matrix4.TMP_MAT.identify();
            var cx = Math.cos(x);
            var cy = Math.cos(y);
            var cz = Math.cos(z);
            var sx = Math.sin(x);
            var sy = Math.sin(y);
            var sz = Math.sin(z);
            m[0] = cy * cz;
            m[1] = sx * sy * cz - cx * sz;
            m[2] = cx * sy * cz + sx * sz;
            m[4] = cy * sz;
            m[5] = sx * sy * sz + cx * cz;
            m[6] = cx * sy * sz - sx * cz;
            m[8] = -sy;
            m[9] = sx * cy;
            m[10] = cx * cz;
            return this.multiply(Matrix4.TMP_MAT);
        };
        Matrix4.prototype.multiply = function (m) {
            var ma = this.m;
            var mb = m.m;
            var tmp = Matrix4.TMP;
            tmp[0] = ma[0] * mb[0] + ma[4] * mb[1] + ma[8] * mb[2] + ma[12] * mb[3];
            tmp[4] = ma[0] * mb[4] + ma[4] * mb[5] + ma[8] * mb[6] + ma[12] * mb[7];
            tmp[8] = ma[0] * mb[8] + ma[4] * mb[9] + ma[8] * mb[10] + ma[12] * mb[11];
            tmp[12] = ma[0] * mb[12] + ma[4] * mb[13] + ma[8] * mb[14] + ma[12] * mb[15];
            tmp[1] = ma[1] * mb[0] + ma[5] * mb[1] + ma[9] * mb[2] + ma[13] * mb[3];
            tmp[5] = ma[1] * mb[4] + ma[5] * mb[5] + ma[9] * mb[6] + ma[13] * mb[7];
            tmp[9] = ma[1] * mb[8] + ma[5] * mb[9] + ma[9] * mb[10] + ma[13] * mb[11];
            tmp[13] = ma[1] * mb[12] + ma[5] * mb[13] + ma[9] * mb[14] + ma[13] * mb[15];
            tmp[2] = ma[2] * mb[0] + ma[6] * mb[1] + ma[10] * mb[2] + ma[14] * mb[3];
            tmp[6] = ma[2] * mb[4] + ma[6] * mb[5] + ma[10] * mb[6] + ma[14] * mb[7];
            tmp[10] = ma[2] * mb[8] + ma[6] * mb[9] + ma[10] * mb[10] + ma[14] * mb[11];
            tmp[14] = ma[2] * mb[12] + ma[6] * mb[13] + ma[10] * mb[14] + ma[14] * mb[15];
            tmp[3] = ma[3] * mb[0] + ma[7] * mb[1] + ma[11] * mb[2] + ma[15] * mb[3];
            tmp[7] = ma[3] * mb[4] + ma[7] * mb[5] + ma[11] * mb[6] + ma[15] * mb[7];
            tmp[11] = ma[3] * mb[8] + ma[7] * mb[9] + ma[11] * mb[10] + ma[15] * mb[11];
            tmp[15] = ma[3] * mb[12] + ma[7] * mb[13] + ma[11] * mb[14] + ma[15] * mb[15];
            for(var n = 0; n < 16; ++n) {
                ma[n] = tmp[n];
            }
            return this;
        };
        Matrix4.prototype.multiplyVector = function (i, o) {
            var m = this.m;
            o.x = i.x * m[0] + i.y * m[1] + i.z * m[2] + m[3];
            o.y = i.x * m[4] + i.y * m[5] + i.z * m[6] + m[7];
            o.z = i.x * m[8] + i.y * m[9] + i.z * m[10] + m[11];
            return o;
        };
        Matrix4.prototype.transpose = function (m) {
            var ma = this.m;
            var mb = m.m;
            var tmp = Matrix4.TMP;
            tmp[0] = mb[0];
            tmp[4] = mb[1];
            tmp[8] = mb[2];
            tmp[12] = mb[3];
            tmp[1] = mb[4];
            tmp[5] = mb[5];
            tmp[9] = mb[6];
            tmp[13] = mb[7];
            tmp[2] = mb[8];
            tmp[6] = mb[9];
            tmp[10] = mb[10];
            tmp[14] = mb[11];
            tmp[3] = mb[12];
            tmp[7] = mb[13];
            tmp[11] = mb[14];
            tmp[15] = mb[15];
            for(var n = 0; n < 16; ++n) {
                ma[n] = tmp[n];
            }
            return this;
        };
        Matrix4.prototype.identify = function () {
            var m = this.m;
            m[0] = 1;
            m[4] = 0;
            m[8] = 0;
            m[12] = 0;
            m[1] = 0;
            m[5] = 1;
            m[9] = 0;
            m[13] = 0;
            m[2] = 0;
            m[6] = 0;
            m[10] = 1;
            m[14] = 0;
            m[3] = 0;
            m[7] = 0;
            m[11] = 0;
            m[15] = 1;
            return this;
        };
        Matrix4.prototype.invert = function () {
            var tmp = Matrix4.TMP;
            var m = this.m;
            var l_det = m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5] * m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1] * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13] + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11] * m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7] * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1] * m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15] + m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9] * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
            if(l_det == 0) {
                return false;
            }
            var inv_det = 1 / l_det;
            tmp[0] = m[9] * m[14] * m[7] - m[13] * m[10] * m[7] + m[13] * m[6] * m[11] - m[5] * m[14] * m[11] - m[9] * m[6] * m[15] + m[5] * m[10] * m[15];
            tmp[4] = m[12] * m[10] * m[7] - m[8] * m[14] * m[7] - m[12] * m[6] * m[11] + m[4] * m[14] * m[11] + m[8] * m[6] * m[15] - m[4] * m[10] * m[15];
            tmp[8] = m[8] * m[13] * m[7] - m[12] * m[9] * m[7] + m[12] * m[5] * m[11] - m[4] * m[13] * m[11] - m[8] * m[5] * m[15] + m[4] * m[9] * m[15];
            tmp[12] = m[12] * m[9] * m[6] - m[8] * m[13] * m[6] - m[12] * m[5] * m[10] + m[4] * m[13] * m[10] + m[8] * m[5] * m[14] - m[4] * m[9] * m[14];
            tmp[1] = m[13] * m[10] * m[3] - m[9] * m[14] * m[3] - m[13] * m[2] * m[11] + m[1] * m[14] * m[11] + m[9] * m[2] * m[15] - m[1] * m[10] * m[15];
            tmp[5] = m[8] * m[14] * m[3] - m[12] * m[10] * m[3] + m[12] * m[2] * m[11] - m[0] * m[14] * m[11] - m[8] * m[2] * m[15] + m[0] * m[10] * m[15];
            tmp[9] = m[12] * m[9] * m[3] - m[8] * m[13] * m[3] - m[12] * m[1] * m[11] + m[0] * m[13] * m[11] + m[8] * m[1] * m[15] - m[0] * m[9] * m[15];
            tmp[13] = m[8] * m[13] * m[2] - m[12] * m[9] * m[2] + m[12] * m[1] * m[10] - m[0] * m[13] * m[10] - m[8] * m[1] * m[14] + m[0] * m[9] * m[14];
            tmp[2] = m[5] * m[14] * m[3] - m[13] * m[6] * m[3] + m[13] * m[2] * m[7] - m[1] * m[14] * m[7] - m[5] * m[2] * m[15] + m[1] * m[6] * m[15];
            tmp[6] = m[12] * m[6] * m[3] - m[4] * m[14] * m[3] - m[12] * m[2] * m[7] + m[0] * m[14] * m[7] + m[4] * m[2] * m[15] - m[0] * m[6] * m[15];
            tmp[10] = m[4] * m[13] * m[3] - m[12] * m[5] * m[3] + m[12] * m[1] * m[7] - m[0] * m[13] * m[7] - m[4] * m[1] * m[15] + m[0] * m[5] * m[15];
            tmp[14] = m[12] * m[5] * m[2] - m[4] * m[13] * m[2] - m[12] * m[1] * m[6] + m[0] * m[13] * m[6] + m[4] * m[1] * m[14] - m[0] * m[5] * m[14];
            tmp[3] = m[9] * m[6] * m[3] - m[5] * m[10] * m[3] - m[9] * m[2] * m[7] + m[1] * m[10] * m[7] + m[5] * m[2] * m[11] - m[1] * m[6] * m[11];
            tmp[7] = m[4] * m[10] * m[3] - m[8] * m[6] * m[3] + m[8] * m[2] * m[7] - m[0] * m[10] * m[7] - m[4] * m[2] * m[11] + m[0] * m[6] * m[11];
            tmp[11] = m[8] * m[5] * m[3] - m[4] * m[9] * m[3] - m[8] * m[1] * m[7] + m[0] * m[9] * m[7] + m[4] * m[1] * m[11] - m[0] * m[5] * m[11];
            tmp[15] = m[4] * m[9] * m[2] - m[8] * m[5] * m[2] + m[8] * m[1] * m[6] - m[0] * m[9] * m[6] - m[4] * m[1] * m[10] + m[0] * m[5] * m[10];
            m[0] = tmp[0] * inv_det;
            m[4] = tmp[4] * inv_det;
            m[8] = tmp[8] * inv_det;
            m[12] = tmp[12] * inv_det;
            m[1] = tmp[1] * inv_det;
            m[5] = tmp[5] * inv_det;
            m[9] = tmp[9] * inv_det;
            m[13] = tmp[13] * inv_det;
            m[2] = tmp[2] * inv_det;
            m[6] = tmp[6] * inv_det;
            m[10] = tmp[10] * inv_det;
            m[14] = tmp[14] * inv_det;
            m[3] = tmp[3] * inv_det;
            m[7] = tmp[7] * inv_det;
            m[11] = tmp[11] * inv_det;
            m[15] = tmp[15] * inv_det;
            return true;
        };
        Matrix4.prototype.determinant = function () {
            var m = this.m;
            return m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5] * m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1] * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13] + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11] * m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7] * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1] * m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15] + m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9] * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
        };
        Matrix4.prototype.projection = function (near, far, fov, aspect) {
            var m = this.m;
            this.identify();
            var fd = 1 / Math.tan((fov * (Math.PI / 180)) / 2);
            var a1 = (far + near) / (near - far);
            var a2 = (2 * far * near) / (near - far);
            m[0] = fd / aspect;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = fd;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = a1;
            m[11] = -1;
            m[12] = 0;
            m[13] = 0;
            m[14] = a2;
            m[15] = 0;
            return this;
        };
        Matrix4.prototype.viewport = function (width, height) {
            var m = this.m;
            this.identify();
            m[0] = width / 2;
            m[5] = -height / 2;
            m[12] = width / 2;
            m[13] = height / 2;
            return this;
        };
        Matrix4.prototype.ortho = function (left, right, bottom, top, near, far) {
            var m = this.m;
            this.identify();
            var x_orth = 2 / (right - left);
            var y_orth = 2 / (top - bottom);
            var z_orth = -2 / (far - near);
            var tx = -(right + left) / (right - left);
            var ty = -(top + bottom) / (top - bottom);
            var tz = -(far + near) / (far - near);
            m[0] = x_orth;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = y_orth;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = z_orth;
            m[11] = 0;
            m[12] = tx;
            m[13] = ty;
            m[14] = tz;
            m[15] = 1;
        };
        Matrix4.prototype.scale = function (x, y, z) {
            var m = this.m;
            m[0] *= x;
            m[5] *= y;
            m[10] *= z;
            return this;
        };
        return Matrix4;
    })();
    volksoper.Matrix4 = Matrix4;    
})(volksoper || (volksoper = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var volksoper;
(function (volksoper) {
    var DisplayObject = (function (_super) {
        __extends(DisplayObject, _super);
        function DisplayObject() {
            _super.apply(this, arguments);

            this._dirty = true;
            this._localMatrix = new volksoper.Matrix4();
            this.alpha = 1;
            this.touchEnabled = true;
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this.width = 0;
            this.height = 0;
            this._rotation = 0;
            this._rotationX = 0;
            this._rotationY = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this.visible = true;
        }
        Object.defineProperty(DisplayObject.prototype, "localMatrix", {
            get: function () {
                var m = this._localMatrix;
                if(this._dirty) {
                    this._dirty = false;
                    var px = this.pivotX || 0;
                    var py = this.pivotY || 0;
                    m.identify().translate(px + this.x, py + this.y, 0).rotate(this.rotationX, this.rotationY, this.rotation).scale(this.scaleX, this.scaleY, 1).translate(-px, -py, 0);
                }
                return m;
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject.prototype._visitRendering = function (v) {
            v.visitDisplayObject(this);
        };
        DisplayObject.prototype.hitTestLocal = function (x, y) {
            return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
        };
        DisplayObject.prototype.hitTest = function (x, y) {
            var localPos = this.globalToLocal(x, y);
            return this.hitTestLocal(localPos.x, localPos.y);
        };
        DisplayObject.prototype.getWorldMatrix = function (m) {
            var p = this.parent;
            if(!m) {
                m = new volksoper.Matrix4();
            }
            if(p && p.getWorldMatrix) {
                p.getWorldMatrix(m);
            }
            m.multiply(this.localMatrix);
            return m;
        };
        DisplayObject.prototype.globalToLocal = function (x, y) {
            var mat = this.getWorldMatrix();
            var m = mat.m;
            if(mat.invert()) {
                return {
                    x: x * m[0] + y * m[1] + m[3],
                    y: x * m[4] + y * m[5] + m[7]
                };
            } else {
                return {
                    x: x,
                    y: y
                };
            }
        };
        Object.defineProperty(DisplayObject.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                this._z = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "pivotX", {
            get: function () {
                return this._pivotX;
            },
            set: function (value) {
                this._pivotX = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "pivotY", {
            get: function () {
                return this._pivotY;
            },
            set: function (value) {
                this._pivotY = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "rotation", {
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                this._rotation = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "rotationX", {
            get: function () {
                return this._rotationX;
            },
            set: function (value) {
                this._rotationX = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "rotationY", {
            get: function () {
                return this._rotationY;
            },
            set: function (value) {
                this._rotationY = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "scaleX", {
            get: function () {
                return this._scaleX;
            },
            set: function (value) {
                this._scaleX = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DisplayObject.prototype, "scaleY", {
            get: function () {
                return this._scaleY;
            },
            set: function (value) {
                this._scaleY = value;
                this._dirty = true;
            },
            enumerable: true,
            configurable: true
        });
        return DisplayObject;
    })(volksoper.Actor);
    volksoper.DisplayObject = DisplayObject;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    (function (Easing) {
        function LINEAR(t, b, c, d) {
            return c * t / d + b;
        }
        Easing.LINEAR = LINEAR;
        function SWING(t, b, c, d) {
            return c * (0.5 - Math.cos(((t / d) * Math.PI)) / 2) + b;
        }
        Easing.SWING = SWING;
        function QUAD_EASEIN(t, b, c, d) {
            return c * (t /= d) * t + b;
        }
        Easing.QUAD_EASEIN = QUAD_EASEIN;
        function QUAD_EASEOUT(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        }
        Easing.QUAD_EASEOUT = QUAD_EASEOUT;
        function QUAD_EASEINOUT(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
        Easing.QUAD_EASEINOUT = QUAD_EASEINOUT;
        function CUBIC_EASEIN(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        }
        Easing.CUBIC_EASEIN = CUBIC_EASEIN;
        function CUBIC_EASEOUT(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
        Easing.CUBIC_EASEOUT = CUBIC_EASEOUT;
        function CUBIC_EASEINOUT(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
        Easing.CUBIC_EASEINOUT = CUBIC_EASEINOUT;
        function QUART_EASEIN(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        }
        Easing.QUART_EASEIN = QUART_EASEIN;
        function QUART_EASEOUT(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
        Easing.QUART_EASEOUT = QUART_EASEOUT;
        function QUART_EASEINOUT(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
        Easing.QUART_EASEINOUT = QUART_EASEINOUT;
        function QUINT_EASEIN(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        }
        Easing.QUINT_EASEIN = QUINT_EASEIN;
        function QUINT_EASEOUT(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        }
        Easing.QUINT_EASEOUT = QUINT_EASEOUT;
        function QUINT_EASEINOUT(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
        Easing.QUINT_EASEINOUT = QUINT_EASEINOUT;
        function SIN_EASEIN(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        }
        Easing.SIN_EASEIN = SIN_EASEIN;
        function SIN_EASEOUT(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        }
        Easing.SIN_EASEOUT = SIN_EASEOUT;
        function SIN_EASEINOUT(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
        Easing.SIN_EASEINOUT = SIN_EASEINOUT;
        function CIRC_EASEIN(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        }
        Easing.CIRC_EASEIN = CIRC_EASEIN;
        function CIRC_EASEOUT(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        }
        Easing.CIRC_EASEOUT = CIRC_EASEOUT;
        function CIRC_EASEINOUT(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            }
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
        Easing.CIRC_EASEINOUT = CIRC_EASEINOUT;
        function ELASTIC_EASEIN(t, b, c, d) {
            if(t === 0) {
                return b;
            }
            if((t /= d) === 1) {
                return b + c;
            }
            var p = d * 0.3;
            var a = c;
            var s = p / 4;
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        Easing.ELASTIC_EASEIN = ELASTIC_EASEIN;
        function ELASTIC_EASEOUT(t, b, c, d) {
            if(t === 0) {
                return b;
            }
            if((t /= d) === 1) {
                return b + c;
            }
            var p = d * 0.3;
            var a = c;
            var s = p / 4;
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        }
        Easing.ELASTIC_EASEOUT = ELASTIC_EASEOUT;
        function ELASTIC_EASEINOUT(t, b, c, d) {
            if(t === 0) {
                return b;
            }
            if((t /= d / 2) === 2) {
                return b + c;
            }
            var p = d * (0.3 * 1.5);
            var a = c;
            var s = p / 4;
            if(t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        }
        Easing.ELASTIC_EASEINOUT = ELASTIC_EASEINOUT;
        function BOUNCE_EASEIN(t, b, c, d) {
            return c - volksoper.Easing.BOUNCE_EASEOUT(d - t, 0, c, d) + b;
        }
        Easing.BOUNCE_EASEIN = BOUNCE_EASEIN;
        function BOUNCE_EASEOUT(t, b, c, d) {
            if((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else {
                if(t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
                } else {
                    if(t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
                    }
                }
            }
        }
        Easing.BOUNCE_EASEOUT = BOUNCE_EASEOUT;
        function BOUNCE_EASEINOUT(t, b, c, d) {
            if(t < d / 2) {
                return volksoper.Easing.BOUNCE_EASEIN(t * 2, 0, c, d) * 0.5 + b;
            } else {
                return volksoper.Easing.BOUNCE_EASEOUT(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        }
        Easing.BOUNCE_EASEINOUT = BOUNCE_EASEINOUT;
        function BACK_EASEIN(t, b, c, d) {
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        }
        Easing.BACK_EASEIN = BACK_EASEIN;
        function BACK_EASEOUT(t, b, c, d) {
            var s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
        Easing.BACK_EASEOUT = BACK_EASEOUT;
        function BACK_EASEINOUT(t, b, c, d) {
            var s = 1.70158;
            if((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
        Easing.BACK_EASEINOUT = BACK_EASEINOUT;
        function EXPO_EASEIN(t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        }
        Easing.EXPO_EASEIN = EXPO_EASEIN;
        function EXPO_EASEOUT(t, b, c, d) {
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }
        Easing.EXPO_EASEOUT = EXPO_EASEOUT;
        function EXPO_EASEINOUT(t, b, c, d) {
            if(t === 0) {
                return b;
            }
            if(t === d) {
                return b + c;
            }
            if((t /= d / 2) < 1) {
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            }
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
        Easing.EXPO_EASEINOUT = EXPO_EASEINOUT;
    })(volksoper.Easing || (volksoper.Easing = {}));
    var Easing = volksoper.Easing;
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var KeyEvent = (function (_super) {
        __extends(KeyEvent, _super);
        function KeyEvent(name, _keyCode, _keyName) {
                _super.call(this, name);
            this._keyCode = _keyCode;
            this._keyName = _keyName;
        }
        KeyEvent.KEY_DOWN = "keyDown";
        KeyEvent.KEY_UP = "keyUp";
        Object.defineProperty(KeyEvent.prototype, "keyCode", {
            get: function () {
                return this._keyCode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeyEvent.prototype, "keyName", {
            get: function () {
                return this._keyName;
            },
            enumerable: true,
            configurable: true
        });
        return KeyEvent;
    })(volksoper.Event);
    volksoper.KeyEvent = KeyEvent;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Resource = (function () {
        function Resource() {
            this._listeners = [];
            this._usable = false;
        }
        Object.defineProperty(Resource.prototype, "usable", {
            get: function () {
                return this._usable;
            },
            enumerable: true,
            configurable: true
        });
        Resource.prototype._setUsable = function () {
            if(!this._usable) {
                this._usable = true;
                for(var n = 0; n < this._listeners.length; ++n) {
                    this._listeners[n](this);
                }
                this._listeners = null;
            }
        };
        Resource.prototype.addUsableListener = function (fn) {
            if(this._listeners) {
                this._listeners.push(fn);
            } else {
                fn(this);
            }
        };
        return Resource;
    })();
    volksoper.Resource = Resource;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var TouchEvent = (function (_super) {
        __extends(TouchEvent, _super);
        function TouchEvent(type, _x, _y, _id) {
                _super.call(this, type);
            this._x = _x;
            this._y = _y;
            this._id = _id;
        }
        TouchEvent.TOUCH_END = "touchEnd";
        TouchEvent.TOUCH_START = "touchStart";
        TouchEvent.TOUCH_MOVE = "touchMove";
        TouchEvent.TOUCH_CANCEL = "touchCancel";
        Object.defineProperty(TouchEvent.prototype, "x", {
            get: function () {
                return this._x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "y", {
            get: function () {
                return this._y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "localX", {
            get: function () {
                return (this._localPosition) ? this._localPosition.x : this._getLocal().x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "localY", {
            get: function () {
                return (this._localPosition) ? this._localPosition.y : this._getLocal().y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        TouchEvent.prototype._getLocal = function () {
            if(this._currentTarget instanceof volksoper.DisplayObject) {
                this._localPosition = (this._currentTarget).globalToLocal(this._x, this._y);
            } else {
                this._localPosition = {
                    x: this._x,
                    y: this._y
                };
            }
            return this._localPosition;
        };
        Object.defineProperty(TouchEvent.prototype, "currentTarget", {
            get: function () {
                return this._currentTarget;
            },
            set: function (actor) {
                this._currentTarget = actor;
                this._localPosition = null;
            },
            enumerable: true,
            configurable: true
        });
        return TouchEvent;
    })(volksoper.Event);
    volksoper.TouchEvent = TouchEvent;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Stage = (function (_super) {
        __extends(Stage, _super);
        function Stage(options) {
                _super.call(this);
            this._running = true;
            this._touchReceivers = {
            };
            this._width = options.width || 320;
            this._height = options.height || 320;
            this._fps = options.fps;
            this._scale = options.scale || 1;
            this._autoScale = options.autoScale;
            this._keyMap = options.keys || {
            };
            this._fullScreen = options.fullScreen;
            this.autoSize = options.autoSize;
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
        Object.defineProperty(Stage.prototype, "running", {
            get: function () {
                return this._running;
            },
            enumerable: true,
            configurable: true
        });
        Stage.prototype.suspend = function () {
            this._running = false;
        };
        Stage.prototype.resume = function () {
            this._running = true;
        };
        Object.defineProperty(Stage.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (width) {
                this._width = width;
                this._adjustStage();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (height) {
                this._height = height;
                this._adjustStage();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "fps", {
            get: function () {
                return this._fps;
            },
            set: function (fps) {
                this._fps = fps;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            set: function (scale) {
                this._scale = scale;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "autoScale", {
            get: function () {
                return this._autoScale;
            },
            set: function (autoScale) {
                this._autoScale = autoScale;
                if(autoScale) {
                    this._autoSize = false;
                }
                this._adjustStage();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "fullScreen", {
            get: function () {
                return this._fullScreen;
            },
            set: function (fullScreen) {
                this._fullScreen = fullScreen;
                this._adjustStage();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "autoSize", {
            get: function () {
                return this._autoSize;
            },
            set: function (autoSize) {
                this._autoSize = autoSize;
                if(autoSize) {
                    this._autoScale = false;
                }
                this._adjustStage();
            },
            enumerable: true,
            configurable: true
        });
        Stage.prototype._adjustStage = function () {
        };
        Object.defineProperty(Stage.prototype, "keyMap", {
            get: function () {
                return this._keyMap;
            },
            enumerable: true,
            configurable: true
        });
        Stage.prototype.registerTouchReceiver = function (obj, id) {
            this._touchReceivers[id] = obj;
        };
        Stage.prototype.unregisterTouchReceiver = function (id) {
            delete this._touchReceivers[id];
        };
        Stage.prototype.propagateTouchEvent = function (type, x, y, id) {
            var target = this._touchReceivers[id];
            if(!target) {
                target = this._findTouch(this.topChild, x, y);
            }
            if(target) {
                target.propagateEvent(new volksoper.TouchEvent(type, x, y, id));
            }
            return target;
        };
        Stage.prototype.broadcastKeyEvent = function (type, keyCode, keyName) {
            this.topChild.broadcastEvent(new volksoper.KeyEvent(type, keyCode, keyName));
        };
        Stage.prototype._findTouch = function (target, x, y) {
            var self = this;
            var found = null;
            if(!target.touchEnabled) {
                return null;
            }
            target.forEachChild(function (a) {
                found = self._findTouch(a, x, y);
                return found;
            }, true);
            if(found) {
                return found;
            }
            if(target instanceof volksoper.DisplayObject) {
                if(target.hitTest(x, y)) {
                    return target;
                } else {
                    return null;
                }
            }
            return null;
        };
        Stage.prototype._render = function (pre, process, post) {
            if(!this.visible) {
                return;
            }
            this._innerRender(this.topChild, pre, process, post);
        };
        Stage.prototype._innerRender = function (obj, pre, process, post) {
            var _this = this;
            if(!obj.visible) {
                return;
            }
            obj._visitRendering(pre);
            obj._visitRendering(process);
            obj.forEachChild(function (child) {
                _this._innerRender(child, pre, process, post);
            });
            obj._visitRendering(post);
        };
        Stage.prototype._createSurfaceImpl = function (width, height, renderer, primitive, name) {
            return null;
        };
        Stage.prototype._createLabelImpl = function (width, height, name) {
            return null;
        };
        Stage.prototype._visitRendering = function (v) {
            v.visitStage(this);
        };
        return Stage;
    })(volksoper.DisplayObject);
    volksoper.Stage = Stage;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var ID = 0;
    function generateUniqueName() {
        return "volksoper-" + (++ID).toString();
    }
    volksoper.generateUniqueName = generateUniqueName;
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Surface = (function (_super) {
        __extends(Surface, _super);
        function Surface(_width, _height, _renderer, _primitive, _name) {
                _super.call(this);
            this._width = _width;
            this._height = _height;
            this._renderer = _renderer;
            this._primitive = _primitive;
            this._name = _name;
            this._invalidate = false;
            this._referenceCount = 0;
            if(this._renderer) {
                this._invalidate = true;
            }
            if(!this._name) {
                this._name = volksoper.generateUniqueName();
            }
        }
        Object.defineProperty(Surface.prototype, "impl", {
            get: function () {
                return this._impl;
            },
            enumerable: true,
            configurable: true
        });
        Surface.prototype.invalidate = function () {
            if(!this._impl) {
                this._invalidate = true;
                return;
            }
            this._impl.invalidate();
        };
        Surface.prototype.addRef = function () {
            return this._impl.addRef();
        };
        Surface.prototype.release = function () {
            return this._impl.release();
        };
        Object.defineProperty(Surface.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Surface.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Surface.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Surface.prototype._render = function () {
            this._impl.render();
        };
        Surface.prototype._setStage = function (stage) {
            if(!stage) {
                this._impl = null;
            } else {
                if(!this._impl) {
                    this._impl = stage._createSurfaceImpl(this._width, this._height, this._renderer, this._primitive, this._name);
                    if(this._invalidate) {
                        this._invalidate = false;
                        this._impl.invalidate();
                    }
                }
            }
        };
        Surface.prototype.hitTest = function (x, y) {
            return 0 <= x && x <= this._width && 0 <= y && y <= this._height;
        };
        return Surface;
    })(volksoper.Resource);
    volksoper.Surface = Surface;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(width, height, name) {
                _super.call(this, width, height, null, false, name);
            this._align = 0;
            this._lineGap = 0;
            this._textColor = 0;
        }
        Object.defineProperty(Label.prototype, "font", {
            get: function () {
                return this._font;
            },
            set: function (font) {
                this._font = font;
                if(this._impl) {
                    this._impl.font(font);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "align", {
            get: function () {
                return this._align;
            },
            set: function (align) {
                this._align = align;
                if(this._impl) {
                    this._impl.align(align);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "lineGap", {
            get: function () {
                return this._lineGap;
            },
            set: function (lineGap) {
                this._lineGap = lineGap;
                if(this._impl) {
                    this._impl.lineGap(lineGap);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "textColor", {
            get: function () {
                return this._textColor;
            },
            set: function (textColor) {
                this._textColor = textColor;
                if(this._impl) {
                    this._impl.textColor(textColor);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                this._text = text;
                if(this._impl) {
                    this._impl.text(text);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "textWidth", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "textHeight", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Label.prototype._onStage = function (stage) {
            if(!this._impl) {
                this._impl = stage._createLabelImpl(this.width, this.height, this.name);
                this._impl.font(this._font);
                this._impl.lineGap(this._lineGap);
                this._impl.align(this._align);
                this._impl.text(this._text);
                this._impl.textColor(this._textColor);
            }
        };
        return Label;
    })(volksoper.Surface);
    volksoper.Label = Label;    
    var Font = (function () {
        function Font(size, bold, italic, face) {
            this.size = size;
            this.bold = bold;
            this.italic = italic;
            this.face = face;
        }
        return Font;
    })();
    volksoper.Font = Font;    
    (function (VerticalAlign) {
        var CENTER = 1;
        var LEFT = 2;
        var RIGHT = 4;
    })(volksoper.VerticalAlign || (volksoper.VerticalAlign = {}));
    var VerticalAlign = volksoper.VerticalAlign;
    (function (HorizontalAlign) {
        var CENTER = 16;
        var TOP = 32;
        var BOTTOM = 64;
    })(volksoper.HorizontalAlign || (volksoper.HorizontalAlign = {}));
    var HorizontalAlign = volksoper.HorizontalAlign;
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
                    target[key] = easing(currentTime, src[key], dst[key], time);
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
        Scene.prototype._visitRendering = function (v) {
            v.visitScene(this);
        };
        return Scene;
    })(volksoper.DisplayObject);
    volksoper.Scene = Scene;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var SceneNode = (function (_super) {
        __extends(SceneNode, _super);
        function SceneNode() {
            var _this = this;
                _super.call(this);
            this.addEventListener(volksoper.Event.ADDED_TO_SCENE, function (e) {
                _this._scene = e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_SCENE, function (e) {
                _this._scene = null;
            });
            this.addEventListener(volksoper.Event.ADDED_TO_STAGE, function (e) {
                _this._stage = e.target;
                _this._setStage();
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_STAGE, function (e) {
                _this._stage = null;
                _this._unsetStage();
            });
        }
        Object.defineProperty(SceneNode.prototype, "scene", {
            get: function () {
                return this._scene;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneNode.prototype, "stage", {
            get: function () {
                return this._stage;
            },
            enumerable: true,
            configurable: true
        });
        SceneNode.prototype._setStage = function () {
        };
        SceneNode.prototype._unsetStage = function () {
        };
        Object.defineProperty(SceneNode.prototype, "story", {
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
        SceneNode.prototype._visitRendering = function (v) {
            v.visitSceneNode(this);
        };
        return SceneNode;
    })(volksoper.DisplayObject);
    volksoper.SceneNode = SceneNode;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            _super.apply(this, arguments);

        }
        Object.defineProperty(Sprite.prototype, "surface", {
            get: function () {
                return this._surface;
            },
            set: function (surface) {
                if(this.stage) {
                    if(this._surface) {
                        this._surface.release();
                    }
                    this._surface = surface;
                    surface._setStage(this.stage);
                    surface.addRef();
                } else {
                    this._surface = surface;
                }
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype._setStage = function () {
            if(this._surface) {
                this._surface._setStage(this.stage);
                this._surface.addRef();
            }
        };
        Sprite.prototype._unsetStage = function () {
            if(this.surface) {
                this._surface.release();
                this._surface._setStage(null);
            }
        };
        Object.defineProperty(Sprite.prototype, "width", {
            get: function () {
                return (this._surface) ? this._surface.width : 0;
            },
            set: function (_) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "height", {
            get: function () {
                return (this._surface) ? this._surface.height : 0;
            },
            set: function (_) {
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.hitTestLocal = function (x, y) {
            if(this._surface) {
                return this._surface.hitTest(x, y);
            }
            return false;
        };
        Sprite.prototype._visitRendering = function (v) {
            v.visitSprite(this);
        };
        return Sprite;
    })(volksoper.SceneNode);
    volksoper.Sprite = Sprite;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var RenderingVisitor = (function () {
        function RenderingVisitor() { }
        RenderingVisitor.prototype.visitDisplayObject = function (o) {
        };
        RenderingVisitor.prototype.visitSprite = function (o) {
            this.visitDisplayObject(o);
        };
        RenderingVisitor.prototype.visitScene = function (o) {
            this.visitDisplayObject(o);
        };
        RenderingVisitor.prototype.visitStage = function (o) {
            this.visitDisplayObject(o);
        };
        RenderingVisitor.prototype.visitSceneNode = function (o) {
            this.visitDisplayObject(o);
        };
        return RenderingVisitor;
    })();
    volksoper.RenderingVisitor = RenderingVisitor;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var SceneDock = (function (_super) {
        __extends(SceneDock, _super);
        function SceneDock(_parentDock) {
                _super.call(this);
            this._parentDock = _parentDock;
            this._id = 0;
        }
        SceneDock.prototype.find = function (name) {
            return null;
        };
        SceneDock.prototype.load = function () {
            var files = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                files[_i] = arguments[_i + 0];
            }
            return null;
        };
        SceneDock.prototype.play = function (name) {
            return false;
        };
        return SceneDock;
    })(volksoper.Actor);
    volksoper.SceneDock = SceneDock;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Platform = (function () {
        function Platform() { }
        Object.defineProperty(Platform.prototype, "prefix", {
            get: function () {
                return '';
            },
            enumerable: true,
            configurable: true
        });
        Platform.create = function create() {
            var ua = navigator.userAgent;
            if(ua.indexOf('Opera') >= 0) {
                return new OperaPlatform();
            } else {
                if(ua.indexOf('MSIE') >= 0) {
                    return new MsPlatform();
                } else {
                    if(ua.indexOf('WebKit') >= 0) {
                        return new WebkitPlatform();
                    } else {
                        if(navigator.product === 'Gecko') {
                            return new MozPlatform();
                        } else {
                            return new Platform();
                        }
                    }
                }
            }
        }
        Platform.prototype.setTransformOrigin = function (e, value) {
            e.style[this.prefix + 'TransformOrigin'] = value;
        };
        Platform.prototype.setTransform = function (e, value) {
            e.style[this.prefix + 'Transform'] = value;
        };
        return Platform;
    })();
    volksoper.Platform = Platform;    
    var WebkitPlatform = (function (_super) {
        __extends(WebkitPlatform, _super);
        function WebkitPlatform() {
            _super.apply(this, arguments);

        }
        Object.defineProperty(WebkitPlatform.prototype, "prefix", {
            get: function () {
                return 'webkit';
            },
            enumerable: true,
            configurable: true
        });
        return WebkitPlatform;
    })(Platform);    
    var MozPlatform = (function (_super) {
        __extends(MozPlatform, _super);
        function MozPlatform() {
            _super.apply(this, arguments);

        }
        Object.defineProperty(MozPlatform.prototype, "prefix", {
            get: function () {
                return 'moz';
            },
            enumerable: true,
            configurable: true
        });
        return MozPlatform;
    })(Platform);    
    var OperaPlatform = (function (_super) {
        __extends(OperaPlatform, _super);
        function OperaPlatform() {
            _super.apply(this, arguments);

        }
        Object.defineProperty(OperaPlatform.prototype, "prefix", {
            get: function () {
                return 'o';
            },
            enumerable: true,
            configurable: true
        });
        return OperaPlatform;
    })(Platform);    
    var MsPlatform = (function (_super) {
        __extends(MsPlatform, _super);
        function MsPlatform() {
            _super.apply(this, arguments);

        }
        Object.defineProperty(MsPlatform.prototype, "prefix", {
            get: function () {
                return 'ms';
            },
            enumerable: true,
            configurable: true
        });
        return MsPlatform;
    })(Platform);    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var HTMLStage = (function (_super) {
        __extends(HTMLStage, _super);
        function HTMLStage(options) {
            var _this = this;
                _super.call(this, options);
            this._mouseId = 0;
            this._platform = volksoper.Platform.create();
            this._adjusting = false;
            var stageId = options.stageId || 'volksoper-stage';
            var stage = document.getElementById(stageId);
            if(!stage) {
                stage = document.createElement('div');
                stage.id = stageId;
                document.body.appendChild(stage);
            }
            var style = window.getComputedStyle(stage, '');
            var currentWidth = parseInt(style.width);
            var currentHeight = parseInt(style.height);
            if(currentWidth && currentHeight) {
                this.scale = Math.min(currentWidth / this.width, currentHeight / this.height);
            } else {
                stage.style.width = this.width + 'px';
                stage.style.height = this.height + 'px';
            }
            (window).onscroll = function (e) {
                var bound = stage.getBoundingClientRect();
                _this._pageX = (window).scrollX || window.pageXOffset + bound.left;
                _this._pageY = (window).scrollY || window.pageYOffset + bound.top;
            };
            (window).onscroll();
            window.onresize = function () {
                _this._adjustStage();
            };
            this._element = stage;
            this._initListeners();
            this._adjustStage();
        }
        HTMLStage.USE_DEFAULT = [
            'input', 
            'textarea', 
            'select', 
            'area'
        ];
        Object.defineProperty(HTMLStage.prototype, "pageX", {
            get: function () {
                return this._pageX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLStage.prototype, "pageY", {
            get: function () {
                return this._pageY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLStage.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLStage.prototype, "platform", {
            get: function () {
                return this._platform;
            },
            enumerable: true,
            configurable: true
        });
        HTMLStage.prototype._adjustCanvas = function () {
        };
        HTMLStage.prototype._adjustStage = function () {
            if(!this._adjusting && this._element) {
                this._adjusting = true;
                if(this.fullScreen) {
                    document.body.style.margin = '0px';
                    document.body.style.padding = '0px';
                    document.body.style.height = '100%';
                    document.body.style.width = '100%';
                    if(this.autoScale) {
                        this.scale = Math.min(window.innerWidth / this.width, window.innerHeight / this.height);
                    } else {
                        if(this.autoSize) {
                            this.scale = 1;
                            this.width = window.innerWidth;
                            this.height = window.innerHeight;
                            console.log(window.innerWidth, window.innerHeight);
                        }
                    }
                }
                this._element.style.width = Math.round(this.scale * this.width) + 'px';
                this._element.style.height = Math.round(this.scale * this.height) + 'px';
                this._element.style.margin = 'auto auto';
                this._adjustCanvas();
                this._adjusting = false;
            }
        };
        HTMLStage.prototype._initListeners = function () {
            var _this = this;
            var s = this._element;
            document.addEventListener('keydown', function (e) {
                if(_this.keyMap[e.keyCode]) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if(_this.running) {
                    _this.broadcastKeyEvent(volksoper.KeyEvent.KEY_DOWN, e.keyCode, _this.keyMap[e.keyCode]);
                }
            }, true);
            document.addEventListener('keyup', function (e) {
                if(_this.running) {
                    _this.broadcastKeyEvent(volksoper.KeyEvent.KEY_UP, e.keyCode, _this.keyMap[e.keyCode]);
                }
            }, true);
            var preventTouchDefault = function (e) {
                var tag = (e.target.tagName).toLowerCase();
                if(HTMLStage.USE_DEFAULT.indexOf(tag) < 0) {
                    e.preventDefault();
                    if(!_this.running) {
                        e.stopPropagation();
                    }
                }
            };
            s.addEventListener('touchstart', preventTouchDefault, true);
            s.addEventListener('touchmove', preventTouchDefault, true);
            s.addEventListener('touchend', preventTouchDefault, true);
            s.addEventListener('touchcancel', preventTouchDefault, true);
            var preventMouseDefault = function (incr) {
                return function (e) {
                    var tag = (e.target.tagName).toLowerCase();
                    if(HTMLStage.USE_DEFAULT.indexOf(tag) < 0) {
                        if(incr) {
                            _this._mouseId++;
                        }
                        e.preventDefault();
                        if(!_this.running) {
                            e.stopPropagation();
                        }
                    }
                }
            };
            s.addEventListener('mousedown', preventMouseDefault(true), true);
            s.addEventListener('mouseup', preventMouseDefault(false), true);
            s.addEventListener('mousemove', preventMouseDefault(false), true);
            var touchListener = function (type, reg, unreg) {
                return function (e) {
                    var touches = e.changedTouches;
                    var len = touches.length;
                    for(var n = 0; n < len; n++) {
                        var touch = touches[n];
                        var id = touch.identifier;
                        var x = (touch.pageX - _this._pageX) / _this.scale;
                        var y = (touch.pageY - _this._pageY) / _this.scale;
                        var obj = _this.propagateTouchEvent(type, x, y, id);
                        if(reg) {
                            _this.registerTouchReceiver(obj, id);
                        }
                        if(unreg) {
                            _this.unregisterTouchReceiver(id);
                        }
                    }
                }
            };
            s.addEventListener('touchstart', touchListener(volksoper.TouchEvent.TOUCH_START, true, false), false);
            s.addEventListener('touchend', touchListener(volksoper.TouchEvent.TOUCH_END, false, true), false);
            s.addEventListener('touchmove', touchListener(volksoper.TouchEvent.TOUCH_MOVE, false, false), false);
            s.addEventListener('touchcancel', touchListener(volksoper.TouchEvent.TOUCH_CANCEL, false, true), false);
            var mouseDown = false;
            s.addEventListener('mousedown', function (e) {
                var x = (e.pageX - _this._pageX) / _this.scale;
                var y = (e.pageY - _this._pageY) / _this.scale;
                var id = _this._mouseId;
                mouseDown = true;
                var obj = _this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_START, x, y, id);
                _this.registerTouchReceiver(obj, id);
            }, false);
            document.addEventListener('mouseup', function (e) {
                var x = (e.pageX - _this._pageX) / _this.scale;
                var y = (e.pageY - _this._pageY) / _this.scale;
                var id = _this._mouseId;
                mouseDown = false;
                _this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_END, x, y, id);
                _this.unregisterTouchReceiver(id);
            }, false);
            s.addEventListener('mousemove', function (e) {
                var x = (e.pageX - _this._pageX) / _this.scale;
                var y = (e.pageY - _this._pageY) / _this.scale;
                var id = _this._mouseId;
                if(mouseDown) {
                    _this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_MOVE, x, y, id);
                }
            }, false);
        };
        return HTMLStage;
    })(volksoper.Stage);
    volksoper.HTMLStage = HTMLStage;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var PreCanvasRenderingVisitor = (function (_super) {
        __extends(PreCanvasRenderingVisitor, _super);
        function PreCanvasRenderingVisitor(_context) {
                _super.call(this);
            this._context = _context;
        }
        PreCanvasRenderingVisitor.prototype.visitDisplayObject = function (o) {
            var m = o.localMatrix.m;
            this._context.save();
            this._context.transform(m[0], m[1], m[4], m[5], m[3], m[7]);
        };
        return PreCanvasRenderingVisitor;
    })(volksoper.RenderingVisitor);
    volksoper.PreCanvasRenderingVisitor = PreCanvasRenderingVisitor;    
    var ProcessCanvasRenderingVisitor = (function (_super) {
        __extends(ProcessCanvasRenderingVisitor, _super);
        function ProcessCanvasRenderingVisitor(_context) {
                _super.call(this);
            this._context = _context;
        }
        ProcessCanvasRenderingVisitor.prototype.visitSprite = function (sprite) {
            if(sprite.surface) {
                sprite.surface.impl.render();
            }
        };
        return ProcessCanvasRenderingVisitor;
    })(volksoper.RenderingVisitor);
    volksoper.ProcessCanvasRenderingVisitor = ProcessCanvasRenderingVisitor;    
    var PostCanvasRenderingVisitor = (function (_super) {
        __extends(PostCanvasRenderingVisitor, _super);
        function PostCanvasRenderingVisitor(_context) {
                _super.call(this);
            this._context = _context;
        }
        PostCanvasRenderingVisitor.prototype.visitDisplayObject = function (o) {
            this._context.restore();
        };
        return PostCanvasRenderingVisitor;
    })(volksoper.RenderingVisitor);
    volksoper.PostCanvasRenderingVisitor = PostCanvasRenderingVisitor;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var CanvasSurfaceImpl = (function () {
        function CanvasSurfaceImpl(width, height, _renderer, _primitive, _name, _stage) {
            this._renderer = _renderer;
            this._primitive = _primitive;
            this._name = _name;
            this._stage = _stage;
            this._referenceCount = 0;
            var element = document.createElement('canvas');
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.position = 'absolute';
            this._element = element;
            this._context = element.getContext("2d");
        }
        CanvasSurfaceImpl.prototype.addRef = function () {
            return ++this._referenceCount;
        };
        CanvasSurfaceImpl.prototype.release = function () {
            return --this._referenceCount;
        };
        CanvasSurfaceImpl.prototype.count = function () {
            return this._referenceCount;
        };
        Object.defineProperty(CanvasSurfaceImpl.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        CanvasSurfaceImpl.prototype.invalidate = function () {
            if(!this._primitive) {
                this._stage._addDirtySurfaceImpl(this);
            }
        };
        CanvasSurfaceImpl.prototype.render = function () {
            if(this._primitive) {
                this._renderer(this, this._stage.context);
            } else {
                this._stage.context.drawImage(this._element, 0, 0);
            }
        };
        CanvasSurfaceImpl.prototype.renderContent = function () {
            this._renderer(this, this._context);
        };
        return CanvasSurfaceImpl;
    })();
    volksoper.CanvasSurfaceImpl = CanvasSurfaceImpl;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var CanvasStage = (function (_super) {
        __extends(CanvasStage, _super);
        function CanvasStage(options) {
                _super.call(this, options);
            this._dirty = [];
        }
        Object.defineProperty(CanvasStage.prototype, "fps", {
            get: function () {
                return this._fps;
            },
            set: function (fps) {
                this._fps = fps;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasStage.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        CanvasStage.prototype._adjustCanvas = function () {
            var c = this._canvas;
            if(!c) {
                c = document.createElement('canvas');
                this.element.appendChild(c);
                this._canvas = c;
                var context = c.getContext('2d');
                this._pre = new volksoper.PreCanvasRenderingVisitor(context);
                this._process = new volksoper.ProcessCanvasRenderingVisitor(context);
                this._post = new volksoper.PostCanvasRenderingVisitor(context);
                this._context = context;
            }
            c.style.width = this.width + 'px';
            c.style.height = this.height + 'px';
            this.platform.setTransformOrigin(c, '0 0');
            this.platform.setTransform(c, 'scale(' + this.scale + ')');
        };
        CanvasStage.prototype._createSurfaceImpl = function (width, height, renderer, primitive, name) {
            return new volksoper.CanvasSurfaceImpl(width, height, renderer, primitive, name, this);
        };
        CanvasStage.prototype.render = function () {
            this.invalidateSurfaceImpl();
            this._render(this._pre, this._process, this._post);
        };
        CanvasStage.prototype.invalidateSurfaceImpl = function () {
            if(this._dirty.length >= 0) {
                var l = this._dirty.length;
                for(var n = 0; n < l; ++n) {
                    this._dirty[n].renderContent();
                }
                this._dirty.splice(0);
            }
        };
        CanvasStage.prototype._addDirtySurfaceImpl = function (dirty) {
            this._dirty.push(dirty);
        };
        return CanvasStage;
    })(volksoper.HTMLStage);
    volksoper.CanvasStage = CanvasStage;    
})(volksoper || (volksoper = {}));
//@ sourceMappingURL=volksoper-canvas.js.map
