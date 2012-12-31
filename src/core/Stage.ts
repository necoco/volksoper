///<reference path="DisplayObject.ts"/>
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>
///<reference path="TouchEvent.ts"/>

module volksoper{
    export class Stage extends volksoper.DisplayObject{
        constructor(){
            super();

            var self = this;

            var addedListener = (e: volksoper.Event)=>{
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.ADDED_TO_STAGE), self);
            };

            var removeListener = (e: volksoper.Event)=>{
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.REMOVE_FROM_STAGE), self);
            };

            this.addEventListener(volksoper.Event.ADDED, addedListener, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, removeListener, true, volksoper.SYSTEM_PRIORITY);
        }

        propagateTouchEvent(type: string, x: number, y: number, id: number, strict: bool){
            var stack: Matrix4[] = [];
            var localStack: number[] = [];
            var actorStack: Actor[] = [];

            var target: Actor = this._findTouch(this, x, y, strict);

            if(target){
                target.propagateEvent(new volksoper.TouchEvent(type, x, y, id));
            }
        }

        private _findTouch(target: DisplayObject, x: number, y: number, strict: bool): DisplayObject{
            var self = this;
            var found = null;

            if(!target.touchEnabled)return null;

            target.forEachChild((a: DisplayObject)=>{
                found = self._findTouch(a, x, y, strict);

                return found;
            });

            if(found){
                return found;
            }

            if(target instanceof DisplayObject){
                var l = target.globalToLocal(x, y);
                if(l.x < target.width && l.y < target.height){
                    if(strict){
                        if(target.hitTestLocal(l.x, l.y)){
                            return target;
                        }else{
                            return null;
                        }
                    }
                    return target;
                }
            }

            return null;
        }
    }
}