
///<reference path="../core/Stage.ts"/>

module volksoper{

    export class HTMLImage extends Surface{
        private _width = 0;
        private _height = 0;
        private _image: HTMLImageElement;
        get image(){
            if(this._instance){
                return this._instance.image;
            }
            return this._image;
        }

        private _instance: HTMLImage = null;
        private _referenceCount = 0;
        addRef(): number{
            return ++this._referenceCount;
        }
        release(): number{
            var count = --this._referenceCount;
            if(this._instance && count <= 0){
                this._instance.release();
            }

            return count;
        }

        _setStage(stage:Stage){
            var found = (<HTMLSceneDock>stage.topScene.dock).find(this._name)
            if(found){
                this._instance = <HTMLImage>found;
                if(found.usable){
                    this._setUsable();
                }else{
                    found.addUsableListener((obj)=>{
                        if(obj){
                            this._setUsable();
                        }else{
                            this._setError();
                        }
                    });
                }
            }else{
                var img = new HTMLImageElement();
                img.onerror = ()=>{
                    this._setError();
                }
                img.onload = ()=>{
                    this._width = img.width;
                    this._height = img.height;
                    this._setUsable();
                }
                this._image = img;
                img.src = this._name;

            }
        }


        constructor(private _name: string, listener: any){
            super(0, 0);

            this.addUsableListener(listener);
        }
    }
}