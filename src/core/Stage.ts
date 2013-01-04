///<reference path="DisplayObject.ts"/>
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>
///<reference path="TouchEvent.ts"/>
///<reference path="Surface.ts"/>
///<reference path="KeyEvent.ts"/>
///<reference path="RenderingVisitor.ts"/>



module volksoper{
    declare class Label{}

    export class Stage extends volksoper.DisplayActor{
        private _running = true;
        get running(){
            return this._running;
        }
        suspend(){
            this._running = false;
        }
        resume(){
            this._running = true;
        }

        get deltaTime(){
            return 1 / this._fps;
        }

        private _stopAnimationFrame = false;
        get loop(){
            return !this._stopAnimationFrame;
        }
        set loop(loop){
            this._stopAnimationFrame = !loop;
        }


        addChild(child: Actor): void{
            if(child instanceof Scene){
                super.addChild(child);
            }else{
                throw Error("Stage can hold Scene only.");
            }
        }

        render(){}
        invalidate(){}

        private _width: number;
        get width(){
            return this._width;
        }
        set width(width){
            this._width = width;
            this._adjustStage();
        }

        private _backgroundColor: number = 0xffffff;
        get backgroundColor(){
            return this._backgroundColor;
        }
        set backgroundColor(color){
            this._backgroundColor = color;
        }

        private _height: number;
        get height(){
            return this._height;
        }
        set height(height){
            this._height = height;
            this._adjustStage();
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
            if(autoScale){
                this._autoSize = false;
            }
            this._adjustStage();
        }

        private _fullScreen: bool;
        get fullScreen(){
            return this._fullScreen;
        }
        set fullScreen(fullScreen){
            this._fullScreen = fullScreen;
            this._adjustStage();
        }

        private _autoSize: bool;
        get autoSize(){
            return this._autoSize;
        }
        set autoSize(autoSize){
            this._autoSize = autoSize;
            if(autoSize){
                this._autoScale = false;
            }
            this._adjustStage();
        }

        private _adjustStage(){}

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
            this._autoScale = options.autoScale;
            this._keyMap = options.keys || {};
            this._fullScreen = options.fullScreen;
            this.autoSize = options.autoSize;
            this.loop = !options.loop;


            var self = this;

            var addedListener = (e: volksoper.Event)=>{
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.ADDED_TO_STAGE), self);
            };

            var removeListener = (e: volksoper.Event)=>{
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.REMOVE_FROM_STAGE), self);
                if(e.target instanceof Scene){
                    (<Scene>e.target)._releaseResource();
                }
            };

            this.addEventListener(volksoper.Event.ADDED, addedListener, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, removeListener, true, volksoper.SYSTEM_PRIORITY);
        }

        propagateTouchEvent(type: string, x: number, y: number, id: number): DisplayActor{
            var target = this._touchReceivers[id];
            if(!target){
                target = this._findTouch(<DisplayActor>this.topChild, x, y);
            }

            if(target){
                target.propagateEvent(new volksoper.TouchEvent(type, x, y, id));
            }else{
                this.dispatchEvent(new volksoper.TouchEvent(type, x, y, id));
            }

            return target;
        }

        broadcastKeyEvent(type: string, keyCode: number, keyName: string){
            this.topChild.broadcastEvent(new KeyEvent(type, keyCode, keyName));
        }

        private _findTouch(target: DisplayActor, x: number, y: number): DisplayActor{
            var self = this;
            var found = null;

            if(!target.touchEnabled)return null;

            target.forEachChild((a: DisplayActor)=>{
                found = self._findTouch(a, x, y);

                return found;
            }, true);

            if(found){
                return found;
            }

            if(target instanceof DisplayActor){
                if(target.hitTest(x, y)){
                    return target;
                }else{
                    return null;
                }
            }

            return null;
        }

        _render(pre: RenderingVisitor, process: RenderingVisitor, post: RenderingVisitor){
            if(!this.visible)return;

            this._innerRender(<DisplayActor>this.topChild, pre, process, post);
        }

        private _innerRender(obj: DisplayActor,
                        pre: RenderingVisitor, process: RenderingVisitor, post: RenderingVisitor): void{
            if(!obj.visible){
                return;
            }

            obj._visitRendering(pre);
            obj._visitRendering(process);


            obj.forEachChild((child: DisplayActor)=>{
                this._innerRender(child, pre, process, post);
            });


            obj._visitRendering(post);
        }

        _createSurfaceImpl(width: number, height: number, renderer:any, primitive: bool, name: string): SurfaceImpl{
            return null;
        }

        _createImageImpl(src: string): SurfaceImpl{
            return this.topScene.dock._createImageImpl(src);
        }

        _createLabelImpl(width: number, height: number, name: string): LabelImpl{
            return null;
        }

        _createSceneDock(): SceneDock{
            return null;
        }

        _visitRendering(v: RenderingVisitor){
            v.visitStage(this);
        }

        get topScene(): Scene{
            return <Scene>this.topChild;
        }
    }
}