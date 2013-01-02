

module volksoper{
    export class RenderingVisitor{
        visitDisplayObject(o){}
        visitSprite(o){
            this.visitDisplayObject(o);
        }
        visitScene(o){
            this.visitDisplayObject(o);
        }
        visitStage(o){
            this.visitDisplayObject(o);
        }
        visitSceneNode(o){
            this.visitDisplayObject(o);
        }
    }
}