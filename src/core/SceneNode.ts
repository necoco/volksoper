
///<reference path="Actor.ts"/>
///<reference path="Scene.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="Story.ts"/>
///<reference path="DisplayObject.ts"/>

module volksoper{
    export class SceneNode extends volksoper.DisplayObject{
        private _scene: volksoper.Scene;
        get scene(): volksoper.Scene{
            return this._scene;
        }

        private _stage: volksoper.Stage;
        get stage(): volksoper.Stage{
            return this._stage;
        }
        private _setStage(){}
        private _unsetStage(){}

        private _story: volksoper.Story;
        get story(): volksoper.Story{
            if(this._story){
                return this._story;
            }

            this._story = this._scene.storyBoard.story(this);
            return this._story;
        }


        _visitRendering(v: RenderingVisitor){
            v.visitSceneNode(this);
        }


        constructor(){
            super();

            this.addEventListener(volksoper.Event.ADDED_TO_SCENE,(e)=>{
                this._scene = <volksoper.Scene>e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_SCENE,(e)=>{
                this._scene = null;
            });


            this.addEventListener(volksoper.Event.ADDED_TO_STAGE,(e)=>{
                this._stage = <Stage>e.target;
                this._setStage();
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_STAGE,(e)=>{
                this._stage = null;
                this._unsetStage();
            });
        }


    }
}