///<reference path="DisplayObject.ts"/>
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>
///<reference path="TouchEvent.ts"/>
///<reference path="Label.ts"/>
///<reference path="Surface.ts"/>


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

        propagateTouchEvent(type: string, x: number, y: number, id: number){
            var stack: Matrix4[] = [];
            var localStack: number[] = [];
            var actorStack: Actor[] = [];

            var target: Actor = this._findTouch(this, x, y);

            if(target){
                target.propagateEvent(new volksoper.TouchEvent(type, x, y, id));
            }
        }

        private _findTouch(target: DisplayObject, x: number, y: number): DisplayObject{
            var self = this;
            var found = null;

            if(!target.touchEnabled)return null;

            target.forEachChild((a: DisplayObject)=>{
                found = self._findTouch(a, x, y);

                return found;
            });

            if(found){
                return found;
            }

            if(target instanceof DisplayObject){
                if(target.hitTest(x, y)){
                    return target;
                }else{
                    return null;
                }
            }

            return null;
        }

        _preRender(o: DisplayObject): void {}
        _postRender(o: DisplayObject): void {}
        _render(o: DisplayObject): void {}

        _createSurfaceImpl(width: number, height: number, renderer:any, primitive: bool, name: string): ISurfaceImpl{
            return null;
        }

        _createLabelImpl(width: number, height: number, name: string): ILabelImpl{
            return null;
        }
    }
}