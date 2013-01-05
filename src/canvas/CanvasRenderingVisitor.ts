
///<reference path="../core/RenderingVisitor.ts"/>

module volksoper{
    export class PreCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D, private _alphaStack: number[]){
            super();
        }

        visitDisplayObject(o: DisplayActor){
            var m = o.localMatrix.m;
            var len = this._alphaStack.length;
            var alpha = (len === 0)?o.alpha: this._alphaStack[len-1] * o.alpha;
            this._alphaStack.push(alpha);

            this._context.save();
            this._context.globalAlpha = alpha;
            this._context.transform(m[0], m[4], m[1], m[5], m[12], m[13]);
        }
    }
    export class ProcessCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D){
            super();
        }

        visitSprite(sprite: Sprite){
            if(sprite.surface){
                sprite.surface._render();
            }
        }
    }
    export class PostCanvasRenderingVisitor extends RenderingVisitor{

        constructor(private _context: CanvasRenderingContext2D, private _alphaStack: number[]){
            super();
        }

        visitDisplayObject(o: DisplayActor){
            this._context.restore();
            this._alphaStack.pop();
        }
    }
}