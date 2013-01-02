///<reference path="../core/HTMLImageImpl.ts"/>

module volksoper{
    export class CanvasImageImpl extends volksoper.HTMLImageImpl{
        render(){
            (<CanvasStage>this._stage).context.drawImage(this._getImage(), 0, 0);
        }

        constructor(src: string, private _stage: Stage){
            super(src);
        }
    }
}