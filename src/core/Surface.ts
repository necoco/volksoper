
module volksoper{

    export class Surface{
        renderer: (ctx: any)=> bool;
        primitiveRenderer: (ctx: any)=> bool;

        invalidate(): void{
        }

        _referenceCount: number = 0;
        addRef(): number{
            return ++this._referenceCount;
        }
        release(): number{
            return --this._referenceCount;
        }
        count(): number{
            return this._referenceCount;
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

        hitTest(x: number, y: number){
            return 0 <= x && x <= this._width && 0 <= y && y <= this._height;
        }

        constructor(private _name: string, private _width: number, private _height: number){

        }

    }

}
