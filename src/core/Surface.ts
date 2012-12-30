
module volksoper{

    export class Surface{
        renderer: (ctx: any)=> void;

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
    }

}
