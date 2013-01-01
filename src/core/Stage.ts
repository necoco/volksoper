///<reference path="DisplayObject.ts"/>
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>
///<reference path="TouchEvent.ts"/>
///<reference path="Label.ts"/>
///<reference path="Surface.ts"/>


module volksoper{
    export class Stage extends volksoper.DisplayObject{
        private _ready = true;
        get ready(){
            return this._ready;
        }
        private _running = true;
        get running(){
            return this._running;
        }

        private _width: number;
        get width(){
            return this._width;
        }

        private _height: number;
        get height(){
            return this._height;
        }

        private _fps: number;
        get fps(){
            return this._fps;
        }
        set fps(fps){
            this._fps = fps;
        }

        private _scale: number;
        get scale(){
            return this._scale;
        }
        set scale(scale){
            this._scale = scale;
        }

        private _autoScale: bool;
        get autoScale(){
            return this._autoScale;
        }
        set autoScale(autoScale){
            this._autoScale = autoScale;
        }

        private _keyMap: any;
        get keyMap(){
            return this._keyMap;
        }

        _touchReceivers: any = {};
        registerTouchReceiver(obj, id){
            this._touchReceivers[id] = obj;
        }
        unregisterTouchReceiver(id){
            delete this._touchReceivers[id];
        }

        constructor(options: any){
            super();
            this._width = options.width || 320;
            this._height = options.height || 320;
            this._fps = options.fps;
            this._scale = options.scale || 1;
            this._autoScale = options.autoScale || false;
            this._keyMap = options.keys || {};

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

        propagateTouchEvent(type: string, x: number, y: number, id: number): DisplayObject{
            var target = this._touchReceivers[id];
            if(!target){
                target = this._findTouch(<DisplayObject>this.topChild, x, y);
            }

            if(target){
                target.propagateEvent(new volksoper.TouchEvent(type, x, y, id));
            }

            return target;
        }

        broadcastKeyEvent(type: string, keyCode: number, keyName: string){
            this.topChild.broadcastEvent(new KeyEvent(type, keyCode, keyName));
        }

        private _findTouch(target: DisplayObject, x: number, y: number): DisplayObject{
            var self = this;
            var found = null;

            if(!target.touchEnabled)return null;

            target.forEachChild((a: DisplayObject)=>{
                found = self._findTouch(a, x, y);

                return found;
            }, true);

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

        private _preRender(o: DisplayObject): void {}
        private _postRender(o: DisplayObject): void {}
        private _inRender(o: DisplayObject): void {}

        render(){
            if(!this.visible)return;

            this._render(<DisplayObject>this.topChild);
        }

        private _render(obj: DisplayObject): void{
            if(!obj.visible){
                return;
            }

            this._preRender(obj);
            this._inRender(obj);

            this.forEachChild((child: DisplayObject)=>{
                this._render(child);
            });


            this._postRender(obj);
        }

        _createSurfaceImpl(width: number, height: number, renderer:any, primitive: bool, name: string): ISurfaceImpl{
            return null;
        }

        _createLabelImpl(width: number, height: number, name: string): ILabelImpl{
            return null;
        }
    }
}