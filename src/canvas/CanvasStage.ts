
///<reference path="../html/HTMLStage.ts"/>
///<reference path="CanvasSurfaceImpl.ts"/>
///<reference path="CanvasSceneDock.ts"/>

module volksoper{
    export class CanvasStage extends volksoper.HTMLStage{
        private _fps: number;
        get fps(){
            return this._fps;
        }
        set fps(fps){
            this._fps = fps;
        }

        private _preRender(o: DisplayObject){

        }

        private _postRender(o: DisplayObject){

        }

        private _render(o: DisplayObject){

        }

        _createSurfaceImpl(width: number, height: number, renderer:any, primitive: bool, name: string): ISurfaceImpl{
            return new CanvasSurfaceImpl(width, height, renderer, primitive, name, new volksoper.CanvasSceneDock(), null);
        }

        constructor(options: any){
            super(options);
        }
    }
}