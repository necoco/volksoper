
///<reference path="../core/Surface.ts"/>
///<reference path="CanvasSceneDock.ts"/>
///<reference path="Platform.ts"/>




module volksoper{
    export class CanvasSurfaceImpl implements ISurfaceImpl{
        private _referenceCount = 0;
        addRef(){
            return ++this._referenceCount;
        }
        release(){
            return --this._referenceCount;
        }
        count(){
            return this._referenceCount;
        }

        private _element: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;

        get name(): string{
            return this._name;
        }

        invalidate(){
            if(!this._primitive){
                 this._stage._addDirtySurfaceImpl(this);
            }
        }

        render(){
            if(this._primitive){
                this._renderer(this, this._stage.context);
            }else{
                this._stage.context.drawImage(this._element, 0, 0);
            }
        }

        renderContent(){
            this._renderer(this, this._context);
        }


        constructor(width: number, height: number, private _renderer: any, private _primitive: bool,
                    private _name: string, private _stage: CanvasStage){
            var element: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.style.position = 'absolute';
            this._element = element;
            this._context = <CanvasRenderingContext2D>element.getContext("2d");
        }
    }
}