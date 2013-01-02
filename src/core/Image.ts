
///<reference path="Surface.ts"/>

module volksoper{

    export class Picture extends Surface{
        private _createImpl(stage: Stage){
            return stage._createImageImpl(this._src);
        }

        constructor(private _src: string){
            super(0, 0);
        }
    }
}