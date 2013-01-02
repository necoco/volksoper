
///<reference path="Actor.ts"/>
///<reference path="Scene.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="Story.ts"/>
///<reference path="DisplayActor.ts"/>

module volksoper{
    export class SceneNode extends volksoper.DisplayActor{
        private _scene: volksoper.Scene;
        get scene(): volksoper.Scene{
            return this._scene;
        }

        private _story: volksoper.Story;
        get story(): volksoper.Story{
            if(this._story){
                return this._story;
            }
            if(this._scene){
                this._story = this._scene.storyBoard.story(this);
            }else{
                this._story = new Story(null, this);
            }
            return this._story;
        }


        _visitRendering(v: RenderingVisitor){
            v.visitSceneNode(this);
        }


        constructor(){
            super();

            this.addEventListener(volksoper.Event.ADDED_TO_SCENE,(e)=>{
                this._scene = <volksoper.Scene>e.target;
                if(this._story){
                    this._story._attachStoryBoard(this._scene.storyBoard);
                }
            }, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_SCENE,(e)=>{
                this._scene = null;
            }, true, volksoper.SYSTEM_PRIORITY);


        }


    }
}