
///<reference path="Surface.ts"/>

module volksoper{

    export class ImageImpl extends SurfaceImpl{

    }

    export class Image extends Surface{
        private _createImpl(stage: Stage){
            return stage.currentScene.dock._createImageImpl(this._src);
        }

        constructor(private _src: string){
            super(0, 0);
        }
    }
}