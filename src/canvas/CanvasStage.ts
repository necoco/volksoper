
///<reference path="../html/HTMLStage.ts"/>
///<reference path="../html/Platform.ts"/>
///<reference path="CanvasSurfaceImpl.ts"/>

module volksoper{
    export class CanvasStage extends volksoper.HTMLStage{
        private _fps: number;
        get fps(){
            return this._fps;
        }
        set fps(fps){
            this._fps = fps;
        }

        private _context: any;
        get context(){
            return this._context;
        }

        private _dirty: CanvasSurfaceImpl[] = [];
        private _pre;
        private _post;
        private _process;


        private _canvas: HTMLCanvasElement;

        private _adjustCanvas(){
            var c = this._canvas;

            if(!c){
                c = <HTMLCanvasElement>document.createElement('canvas');
                this.element.appendChild(c);
                this._canvas = c;

                var context = c.getContext('2d');
                this._pre = new PreCanvasRenderingVisitor(context);
                this._process = new ProcessCanvasRenderingVisitor(context);
                this._post = new PostCanvasRenderingVisitor(context);
                this._context = context;
            }

            c.width = this.width;
            c.height = this.height;
            this.platform.setTransformOrigin(c, '0 0');
            this.platform.setTransform(c, 'scale(' + this.scale + ')');
        }


        constructor(options: any){
            super(options);
        }

        render(){
            this.invalidateSurfaceImpl();

            this.context.fillStyle = '#' + this.backgroundColor.toString(16);
            this.context.fillRect(0, 0, this.width, this.height);
            this._render(this._pre, this._process, this._post);
        }

        private invalidateSurfaceImpl(){
            if(this._dirty.length >= 0){
                var l = this._dirty.length;
                for(var n = 0; n < l; ++n){
                    this._dirty[n].renderContent();
                }
                this._dirty.splice(0);
            }
        }

        _addDirtySurfaceImpl(dirty: CanvasSurfaceImpl){
            this._dirty.push(dirty);
        }

        _createSceneDock(): SceneDock{
            var parent = (this.numChildren !== 0)? <CanvasSceneDock>this.topScene.dock: null;
            return new volksoper.CanvasSceneDock(this, parent);
        }
    }
}