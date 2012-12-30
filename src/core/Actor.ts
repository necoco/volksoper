///<reference path="Event.ts"/>


module volksoper{

    export var SYSTEM_PRIORITY: number = 100000000;

    export class Actor{
        private static _handlerNameTable: Object = {};

        private _parent: Actor;
        get parent(): Actor{
            return this._parent;
        }

        private _children: Array;
        private _captureHandlers: Object;
        private _bubbleHandlers: Object;
        private _toRemove: Actor[];
        private _forEach: number = 0;

        public name: String;

        constructor(){
        }

        addChild(child: Actor): void{
            this._children = this._children || [];

            child._parent = this;
            this._children.push(child);

            child.propagateEvent(new volksoper.Event(volksoper.Event.ADDED));
        }

        removeChild(child: Actor): bool{
            if(!this._children) return false;

            if(this._forEach !== 0){
                this._toRemove = this._toRemove || [];
                this._toRemove.push(child);

                return true;
            }

            var index: number = this._children.indexOf(child);
            if(index >= 0){
                child.propagateEvent(new volksoper.Event(volksoper.Event.REMOVE))
                this._children.splice(index, 1);
                child._parent = null;
                return true;
            }
            return false;
        }

        popChild(): Actor{
            var top: Actor = this.topChild;
            if(!top)return null;

            top.propagateEvent(new volksoper.Event(volksoper.Event.REMOVE));

            this._children.pop();
            top._parent = null;
            return top;
        }

        swapTop(child: Actor): Actor{
            var result = this.popChild();
            if(result){
                this.addChild(child);
            }

            return result;
        }

        get topChild(): Actor{
            if(!this._children || this._children.length == 0) return null;
            return this._children[this._children.length-1];
        }

        get numChildren(): number{
            if(!this._children) return 0;
            else return this._children.length;
        }

        sortChildren(comparator: (actor1: Actor, actor2: Actor) => number): void{
            this._children = this._children || [];

            this._children.sort(comparator);
        }

        getChild(index: number): Actor{
            if(this._children == null)return null;

            return this._children[index];
        }

        addEventListener(type: String, listener: (event) => void, capture?: bool, priority?: number): void{
            if(capture){
                this._captureHandlers = Actor._registerListener(this._captureHandlers, type , listener, priority);
            }else{
                this._bubbleHandlers = Actor._registerListener(this._bubbleHandlers, type, listener, priority);
            }
        }

        removeEventListener(type: String, listener: (event) => void, capture?: bool): bool{
            if(capture){
                return Actor._removeHandler(this._captureHandlers, type, listener);
            }else{
                return Actor._removeHandler(this._bubbleHandlers, type, listener);
            }
        }


        private static _removeHandler(map, type, listener): bool{
            if(!map){
                return false;
            }

            var handlers = map[type];
            for(var index in handlers){
                var handler = handlers[index].handler;
                if(handler === listener){
                    handlers.splice(index, 1);
                    return true;
                }
            }

            return false;
        }

        private static _registerListener(map: Object, type, handler, priority){
            priority = priority || 0;
            map = map || {};

            if(!(type in map)){
                map[type] = [];
            }

            map[type].push({priority: priority, handler: handler});
            map[type].sort((lhs, rhs)=>{return rhs.priority - lhs.priority;});

            return map;
        }

        dispatchEvent(event: volksoper.Event): bool{
            return this._handleEvent(event, this, false);
        }

        propagateEvent(event: volksoper.Event): bool{
            var result: bool = false;
            var chain: Actor[] = [this];
            var current: Actor = this;
            var n: number = 0;

            while((current = current._parent)){
                chain.push(current);
            }

            var len = chain.length;
            //capture
            for(n = len-1; n >= 0; n--){
                result = (<Actor>chain[n])._handleEvent(event, this, true) || result;

                if(!event.propagates){
                    return result;
                }
            }

            //bubble
            for(n = 0; n < len; n++){
                result = (<Actor>chain[n])._handleEvent(event, this, false) || result;

                if(!event.propagates){
                    return result;
                }
            }

            return result;
        }

        broadcastEvent(event: volksoper.Event, target?: volksoper.Actor): bool{
            return this._broadcastEvent(event, (target)? target: this);
        }

        private _broadcastEvent(event: volksoper.Event, target: Actor): bool{
            var result: bool = false;

            result = this._handleEvent(event, target, false) || result;

            this.forEachChild((child: Actor)=>{
                result = child._broadcastEvent(event, target) || result;
            });

            return result;
        }

        broadcast(name: string, ...args: any[]): void{
            if(name in this){
                this[name].call(this, args);
            }

            this.forEachChild((child: any)=>{
                child.broadcast(name, args);
            });
        }

        forEachChild(fn: (child:any)=> void): void{
            this._forEach++;
            if(this._children){
                var len = this._children.length;
                for(var n: number = 0; n < len; ++n){
                    fn(this._children[n]);
                }
            }
            this._forEach--;

            if(this._forEach === 0){
                var r = this._toRemove;
                if(r){
                    var rlen = r.length;
                    for(var m = 0; m < rlen; m++){
                        this.removeChild(r[m]);
                    }
                    r.splice(0);
                }

            }
        }

        private _handleEvent(event: volksoper.Event, target: Actor, capture: bool): bool{
            //call my handler
            event.currentTarget = this;
            event.target = target;
            if(!capture && this._callHandler(event) && event.stopImmediate){
                return true;
            }


            var type: string = event.type;
            var handlers: Array;
            if(capture && this._captureHandlers){
                handlers = this._captureHandlers[type];
            }else if(!capture && this._bubbleHandlers){
                handlers = this._bubbleHandlers[type];
            }

            if(!handlers || handlers.length == 0){
                return false;
            }

            //call registered handlers
            for(var index in handlers){
                var handler = handlers[index].handler;

                event.currentTarget = this;
                event.target = target;
                handler(event);

                if(event.stopImmediate){
                    break;
                }
            }

            return true;
        }

        private _callHandler(event: volksoper.Event): bool{
            var handlerName: string = Actor._handlerNameTable[event.type] || Actor._getHandlerName(event);
            if(this[handlerName]){
                this[handlerName](event);
                return true;
            }

            return false;
        }

        private static _getHandlerName(event: volksoper.Event): string{
            var type = event.type;
            var name = "on" + type.charAt(0).toUpperCase() + type.substr(1);

            Actor._handlerNameTable[type] = name;
            return name;
        }
    }
}