
///<reference path="../html/HTMLStage.ts"/>

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

        constructor(options: any){
            super(options);
        }
    }
}