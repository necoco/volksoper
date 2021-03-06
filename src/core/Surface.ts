
///<reference path="Resource.ts"/>
///<reference path="Stage.ts"/>
///<reference path="Utility.ts"/>

module volksoper{

    export class SurfaceImpl extends ResourceImpl{
        invalidate(): void{}
        render(): void{}
        width(): number{throw new Error('unimplemented');}
        height(): number{throw new Error('unimplemented');}
        clearCache(): void{}
    }

    export class Surface extends Resource{
        private _impl: SurfaceImpl;

        private _invalidate: bool = false;
        invalidate(): void{
            if(!this._impl){
                this._invalidate = true;
                return;
            }
            this._impl.invalidate();
        }

        get width(){
            return this._impl.width();
        }

        get height(){
            return this._impl.height();
        }

        _render(){
            if(this._impl){
                this._impl.render();
            }
        }

        _clearCache(){
            if(this._impl){
                this._impl.clearCache();
            }
        }

        _setStage(stage: Stage){
            super._setStage(stage);

            if(this._invalidate){
                this._invalidate = false;
                this._impl.invalidate();
            }
        }

        private _createImpl(stage: Stage): ResourceImpl{
            return stage.currentScene.dock._createSurfaceImpl(
                    this._width, this._height, this._renderer, this._primitive, this._name);
        }

        hitTestLocal(x: number, y: number): bool{
            return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
        }

        constructor(private _width: number,
                    private _height: number,
                    private _renderer?: (surface:Surface, ctx:any)=>bool,
                    private _primitive?: bool,
                    private _name?: string){
            super();
            if(this._renderer){
                this._invalidate = true;
            }
        }

    }

}
