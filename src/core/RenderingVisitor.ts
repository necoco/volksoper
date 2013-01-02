
///<reference path="DisplayObject.ts"/>
///<reference path="Sprite.ts"/>
///<reference path="Scene.ts"/>
///<reference path="Stage.ts"/>


module volksoper{
    export class RenderingVisitor{
        visitDisplayObject(o: DisplayObject){}
        visitSprite(o: Sprite){
            this.visitDisplayObject(o);
        }
        visitScene(o: Scene){
            this.visitDisplayObject(o);
        }
        visitStage(o: Stage){
            this.visitDisplayObject(o);
        }
        visitSceneNode(o: SceneNode){
            this.visitDisplayObject(o);
        }
    }
}