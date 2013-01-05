
///<reference path="SceneNode.ts"/>

module volksoper{
    export class Sprite extends SceneNode{
        private _surface: volksoper.Surface;
        get surface():volksoper.Surface {return this._surface;}
        set surface(surface: volksoper.Surface){
            if(this.stage){
                if(this._surface){
                    this._surface.release();
                }
                this._surface = surface;
                surface._setStage(this.stage);
                surface.addRef();
            }else{
                this._surface = surface;
            }
        }

        private _setStage(){
            if(this._surface){
                this._surface._setStage(this.stage);
                this._surface.addRef();
            }
        }

        private _unsetStage(){
            if(this._surface){
                this._surface.release();
            }
        }

        private _dirtyFlag: bool;
        get _dirty(): bool{
            return this._dirtyFlag;
        }
        set _dirty(dirty:bool){
            this._dirtyFlag = dirty;
            if(this.surface && dirty){
                this.surface._clearCache();
            }
        }


        get width(): number{
            return (this._surface)? this._surface.width: 0;
        }
        set width(_: number){}

        get height(): number{
            return (this._surface)? this._surface.height: 0;
        }
        set height(_: number){}

        _visitRendering(v: RenderingVisitor){
            v.visitSprite(this);
        }

        constructor(props?: any){
            super();
            this.applyProperties(props);
        }
    }
}