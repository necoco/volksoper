
///<reference path="../core/RenderingVisitor.ts"/>

module volksoper{
    export class PreCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D){
            super();
        }

        visitDisplayObject(o: DisplayObject){
            var m = o.localMatrix.m;

            this._context.save();
            this._context.transform(m[0], m[1], m[4], m[5], m[3], m[7]);
        }
    }
    export class ProcessCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D){
            super();
        }

        visitSprite(sprite: Sprite){
            if(sprite.surface){
                sprite.surface.impl.render();
            }
        }
    }
    export class PostCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D){
            super();
        }

        visitDisplayObject(o: DisplayObject){
            this._context.restore();
        }
    }
}