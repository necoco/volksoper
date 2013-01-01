
///<reference path="../core/Stage.ts"/>


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

        constructor(options: any){
            super(options);

            var stageId = options.stageId || 'volksoper-stage';

            var stage = document.getElementById(stageId);
            if(!stage){
                stage = document.createElement('div');
                stage.style.position = 'absolute';

                document.body.appendChild(stage);
            }

            var style = window.getComputedStyle(stage, '');
            var currentWidth = parseInt(style.width);
            var currentHeight = parseInt(style.height);

            if(currentWidth && currentHeight){
                this.scale = Math.min(currentWidth/this.width, currentHeight/this.height);
            }else{
                stage.style.width = this.width + 'px';
                stage.style.height = this.height + 'px';
            }

            (<any>window).onscroll = (e: any)=>{
                var bound = stage.getBoundingClientRect();
                this._pageX = (<any>window).scrollX || window.pageXOffset + bound.left;
                this._pageY = (<any>window).scrollY || window.pageYOffset + bound.top;
            };
            (<any>window).onscroll();

            this._element = stage;

            this._initListeners();
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
            var mouseListener = (type, down, move, reg, unreg)=>{
                return (e: MouseEvent)=>{
                    var x = (e.pageX - this._pageX) / this.scale;
                    var y = (e.pageY - this._pageY) / this.scale;
                    var id = this._mouseId;
                    if(!move){
                        mouseDown = down;
                    }
                    if(mouseDown){
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

            s.addEventListener('mousedown', mouseListener(volksoper.TouchEvent.TOUCH_START, true, false, true, false), false);
            document.addEventListener('mouseup', mouseListener(volksoper.TouchEvent.TOUCH_END, false, false, true, false), false);
            s.addEventListener('mousemove', mouseListener(volksoper.TouchEvent.TOUCH_MOVE, false, true, false, false), false);
        }
    }
}