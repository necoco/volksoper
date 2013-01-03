
///<reference path="../core/Stage.ts"/>
///<reference path="Platform.ts"/>



module volksoper{
    export class HTMLStage extends Stage{
        static USE_DEFAULT = ['input', 'textarea', 'select', 'area'];

        private _mouseId = 0;

        private _pageX: number;
        get pageX(){
            return this._pageX;
        }
        private _pageY: number;
        get pageY(){
            return this._pageY;
        }

        private _element: HTMLElement;
        get element(){
            return this._element;
        }

        private _platform: Platform = Platform.instance();
        get platform(){
            return this._platform;
        }

        constructor(options: any){
            super(options);


            var stageId = options.stageId || 'volksoper-stage';

            var stage = document.getElementById(stageId);
            if(!stage){
                stage = document.createElement('div');
                stage.id = stageId;
                document.body.appendChild(stage);
            }
            stage.style.overflow = "hidden";

            var style = window.getComputedStyle(stage, '');
            var currentWidth = parseInt(style.width);
            var currentHeight = parseInt(style.height);

            if(currentWidth && currentHeight){
                this.scale = Math.min(currentWidth/this.width, currentHeight/this.height);
            }else{
                stage.style.width = this.width + 'px';
                stage.style.height = this.height + 'px';
            }

            this._element = stage;

            this._initListeners();
            this._adjustStage();

            (<any>window).onscroll = (e: any)=>{
                this._adjustStage();
                this.render();
            };

            window.onresize = ()=>{
                this._adjustStage();
                this.render();
            }
        }

        private _adjusting = false;
        private _adjustCanvas(){}
        private _adjustStage(){

            if(!this._adjusting && this._element){
                this._adjusting = true;

                if(this.fullScreen){
                    document.body.style.margin = '0px';
                    document.body.style.padding = '0px';
                    document.body.style.height = '100%';
                    document.body.style.width = '100%';

                    if(this.autoScale){
                        this.scale = Math.min(window.innerWidth/this.width, window.innerHeight/this.height);
                    }else if(this.autoSize){
                        this.scale = 1;
                        this.width = window.innerWidth;
                        this.height = window.innerHeight;
                    }
                }
                this._element.style.width = Math.round(this.scale * this.width) + 'px';
                this._element.style.height = Math.round(this.scale * this.height) + 'px';
                this._element.style.margin = 'auto auto';

                this._adjustCanvas();

                var bound = this._element.getBoundingClientRect();
                this._pageX = (<any>window).scrollX + bound.left || window.pageXOffset + bound.left;
                this._pageY = (<any>window).scrollY + bound.top || window.pageYOffset + bound.top;

                this._adjusting = false;
            }
        }

        private _initListeners(){
            var s = this._element;

            document.addEventListener('keydown', (e: KeyboardEvent)=>{
                if(this.keyMap[e.keyCode]){
                    e.preventDefault();
                    e.stopPropagation();
                }

                if(this.running){
                    this.broadcastKeyEvent(KeyEvent.KEY_DOWN, e.keyCode, this.keyMap[e.keyCode]);
                }
            }, true);

            document.addEventListener('keyup', (e: KeyboardEvent)=>{
                if(this.running){
                    this.broadcastKeyEvent(KeyEvent.KEY_UP, e.keyCode, this.keyMap[e.keyCode]);
                }
            }, true);

            var preventTouchDefault = (e: any)=>{
                var tag = (e.target.tagName).toLowerCase();
                if(HTMLStage.USE_DEFAULT.indexOf(tag) < 0){
                    e.preventDefault();
                    if(!this.running){
                        e.stopPropagation();
                    }
                }
            };

            s.addEventListener('touchstart', preventTouchDefault, true);
            s.addEventListener('touchmove', preventTouchDefault, true);
            s.addEventListener('touchend', preventTouchDefault, true);
            s.addEventListener('touchcancel', preventTouchDefault, true);

            var preventMouseDefault = (incr)=>{
                return (e: any)=>{
                    var tag = (e.target.tagName).toLowerCase();
                    if(HTMLStage.USE_DEFAULT.indexOf(tag) < 0){
                        if(incr){
                            this._mouseId++;
                        }
                        e.preventDefault();
                        if(!this.running){
                            e.stopPropagation();
                        }
                    }
                }
            };

            s.addEventListener('mousedown', preventMouseDefault(true), true);
            s.addEventListener('mouseup', preventMouseDefault(false), true);
            s.addEventListener('mousemove', preventMouseDefault(false), true);


            var touchListener = (type, reg, unreg)=>{
                return (e: any)=>{
                    var touches = e.changedTouches;
                    var len = touches.length;
                    for(var n = 0; n < len; n++){
                        var touch = touches[n];
                        var id = touch.identifier;
                        var x = (touch.pageX - this._pageX) / this.scale;
                        var y = (touch.pageY - this._pageY) / this.scale;

                        var obj = this.propagateTouchEvent(type, x, y, id);
                        if(reg){
                            this.registerTouchReceiver(obj, id);
                        }
                        if(unreg){
                            this.unregisterTouchReceiver(id);
                        }
                    }
                }
            };

            s.addEventListener('touchstart', touchListener(volksoper.TouchEvent.TOUCH_START, true, false), false);
            s.addEventListener('touchend', touchListener(volksoper.TouchEvent.TOUCH_END, false, true), false);
            s.addEventListener('touchmove', touchListener(volksoper.TouchEvent.TOUCH_MOVE, false, false), false);
            s.addEventListener('touchcancel', touchListener(volksoper.TouchEvent.TOUCH_CANCEL, false, true), false);


            var mouseDown = false;

            s.addEventListener('mousedown',(e)=>{
                var x = (e.pageX - this._pageX) / this.scale;
                var y = (e.pageY - this._pageY) / this.scale;
                var id = this._mouseId;
                mouseDown = true;
                var obj = this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_START, x, y, id);
                this.registerTouchReceiver(obj, id);
            }, false);
            document.addEventListener('mouseup',(e)=>{
                var x = (e.pageX - this._pageX) / this.scale;
                var y = (e.pageY - this._pageY) / this.scale;
                var id = this._mouseId;
                mouseDown = false;
                this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_END, x, y, id);
                this.unregisterTouchReceiver(id);
            }, false);
            s.addEventListener('mousemove',(e)=>{
                var x = (e.pageX - this._pageX) / this.scale;
                var y = (e.pageY - this._pageY) / this.scale;
                var id = this._mouseId;
                if(mouseDown){
                    this.propagateTouchEvent(volksoper.TouchEvent.TOUCH_MOVE, x, y, id);
                }
            }, false);
        }

        _createSceneDock(): SceneDock{
            var parent = (this.numChildren !== 0)? this.topScene.dock: null;
            return new volksoper.HTMLSceneDock(this, parent);
        }
    }


}