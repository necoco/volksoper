
///<reference path="../core/Surface.ts"/>
///<reference path="CanvasSceneDock.ts"/>
///<reference path="Platform.ts"/>




module volksoper{
    export class CanvasSurfaceImpl extends SurfaceImpl{

        width(): number{
            return this._width;
        }

        height(): number{
            return this._height;
        }


        private _element: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;

        name(): string{
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


        constructor(private _width: number, private _height: number, private _renderer: any, private _primitive: bool,
                    private _name: string, private _stage: CanvasStage){
            super();

            if(!this._name){
                this._name = volksoper.generateUniqueName("surface");
            }

            if(!_primitive){
                var element: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
                element.style.width = this._width + 'px';
                element.style.height = this._height + 'px';
                element.style.position = 'absolute';
                this._element = element;
                this._context = <CanvasRenderingContext2D>element.getContext("2d");
            }
        }
    }
}