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
            o[0] = i[0] * m[0] + i[1] * m[1] + i[2] * m[2] + i[3] * m[3];
            o[1] = i[0] * m[4] + i[1] * m[5] + i[2] * m[6] + i[3] * m[7];
            o[2] = i[0] * m[8] + i[1] * m[9] + i[2] * m[10] + i[3] * m[11];
            o[3] = i[0] * m[12] + i[1] * m[13] + i[2] * m[14] + i[3] * m[15];
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
            this.width = 0;
            this.height = 0;
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
        DisplayObject.prototype.getWorldMatrix = function (m) {
            var current = this;
            do {
                if(current.getWorldMatrix) {
                    current.getWorldMatrix(m);
                }
            }while(current = current.parent)
            m.multiply(this.localMatrix);
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
        function LINEAR(t) {
            return t;
        }
        Easing.LINEAR = LINEAR;
    })(volksoper.Easing || (volksoper.Easing = {}));
    var Easing = volksoper.Easing;
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Surface = (function () {
        function Surface(_name, _width, _height) {
            this._name = _name;
            this._width = _width;
            this._height = _height;
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
        return Surface;
    })();
    volksoper.Surface = Surface;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(name, width, height) {
                _super.call(this, name, width, height);
            this.align = 0;
            this.lineGap = 0;
            this.textColor = 0;
        }
        Object.defineProperty(Label.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                this._text = text;
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
    })(volksoper.DisplayObject);
    volksoper.Scene = Scene;    
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
        SceneDock.prototype._generateName = function () {
            if(this._parentDock) {
                return this._parentDock._generateName();
            } else {
                return "volksoper-" + (++this._id).toString();
            }
        };
        SceneDock.prototype.find = function (name) {
            return null;
        };
        SceneDock.prototype.createFont = function (size, bold, italic, face) {
            return null;
        };
        SceneDock.prototype.createLabel = function (width, height, name) {
            return null;
        };
        SceneDock.prototype.createSurface = function (width, height, name) {
            return null;
        };
        SceneDock.prototype.load = function () {
            var files = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                files[_i] = arguments[_i + 0];
            }
            return null;
        };
        SceneDock.prototype.clone = function (surface) {
            return null;
        };
        return SceneDock;
    })(volksoper.Actor);
    volksoper.SceneDock = SceneDock;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
                _super.call(this);
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
    })(volksoper.DisplayObject);
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
    })(volksoper.DisplayObject);
    volksoper.Stage = Stage;    
})(volksoper || (volksoper = {}));
var volksoper;
(function (volksoper) {
    var TouchEvent = (function (_super) {
        __extends(TouchEvent, _super);
        function TouchEvent(type, _x, _y) {
                _super.call(this, type);
            this._x = _x;
            this._y = _y;
            this._localX = 0;
            this._localY = 0;
        }
        TouchEvent.TMP_MAT = new volksoper.Matrix4();
        TouchEvent.TMP_IN = [
            0, 
            0, 
            0, 
            1
        ];
        TouchEvent.TMP_OUT = [
            0, 
            0, 
            0, 
            1
        ];
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
                return this._localX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "localY", {
            get: function () {
                return this._localY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchEvent.prototype, "currentTarget", {
            get: function () {
                return this._currentTarget;
            },
            set: function (actor) {
                this._currentTarget = actor;
                var i = TouchEvent.TMP_IN;
                var o = TouchEvent.TMP_OUT;
                var m = TouchEvent.TMP_MAT;
                if(actor instanceof volksoper.DisplayObject) {
                    (actor).getWorldMatrix(m);
                    i[0] = this._x;
                    i[1] = this._y;
                    m.multiplyVector(i, o);
                    this._localX = o[0];
                    this._localY = o[1];
                } else {
                    this._localX = null;
                    this._localY = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        return TouchEvent;
    })(volksoper.Event);
    volksoper.TouchEvent = TouchEvent;    
})(volksoper || (volksoper = {}));
