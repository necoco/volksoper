
///<reference path="Resource.ts"/>
///<reference path="Stage.ts"/>
///<reference path="Utility.ts"/>

module volksoper{

    export interface ISurfaceImpl{
        addRef(): number;
        release(): number;
        invalidate(): void;
        render(): void;
    }

    export class Surface extends Resource{
        private _impl: ISurfaceImpl;

        private _invalidate: bool = false;
        invalidate(): void{
            if(!this._impl){
                this._invalidate = true;
                return;
            }
            this._impl.invalidate();
        }

        _referenceCount: number = 0;
        addRef(): number{
            return this._impl.addRef();
        }
        release(): number{
            return this._impl.release();
        }
        get name(): string{
            return this._name;
        }

        get width(){
            return this._width;
        }

        get height(){
            return this._height;
        }

        _render(){
            this._impl.render();
        }

        _onStage(stage: Stage): void{
            if(!this._impl){
                this._impl = stage._createSurfaceImpl(
                        this._width, this._height, this._renderer, this._primitive, this._name);
                if(this._invalidate){
                    this._invalidate = false;
                    this._impl.invalidate();
                }
            }
        }

        hitTest(x: number, y: number): bool{
            return 0 <= x && x <= this._width && 0 <= y && y <= this._height;
        }

        constructor(private _width: number,
                    private _height: number,
                    private _renderer?: (surface:Surface, ctx:any)=>bool,
                    private _primitive?: bool,
                    private _name?: string){
            super();
            if(!this._name){
                this._name = volksoper.generateUniqueName();
            }
        }

    }

}
