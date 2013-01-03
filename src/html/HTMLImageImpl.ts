
///<reference path="../core/Stage.ts"/>

declare class Image{}

module volksoper{

    export class HTMLImageImpl extends SurfaceImpl{
        private _width = 0;
        width(){
            return this._width;
        }

        private _height = 0;
        height(){
            return this._height;
        }
        private _image: any;
        _getImage(){
            return this._image;
        }

        private _referenceCount = 0;
        addRef(): number{
            return ++this._referenceCount;
        }
        release(): number{
            return --this._referenceCount;
        }
        render(){}
        invalidate(): void{}
        name(){
            return this._src;
        }

        constructor(private _src: string){
            super();

            var img: any = document.createElement('img');
            img.onerror = ()=>{
                this._setError();
            }
            img.onload = ()=>{
                this._width = img.width;
                this._height = img.height;
                this._setUsable();
            }
            this._image = img;
            img.src = this._src;

        }
    }
}