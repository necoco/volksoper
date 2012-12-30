
///<reference path="Actor.ts"/>
///<reference path="Scene.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="Story.ts"/>
///<reference path="DisplayObject.ts"/>

module volksoper{
    export class Sprite extends volksoper.DisplayObject{
        private _scene: volksoper.Scene;
        get scene(): volksoper.Scene{
            return this._scene;
        }

        private _stage: volksoper.Stage;
        get stage(): volksoper.Stage{
            return this._stage;
        }

        private _story: volksoper.Story;
        get story(): volksoper.Story{
            if(this._story){
                return this._story;
            }

            this._story = this._scene.storyBoard.story(this);
            return this._story;
        }

        private _surface: volksoper.Surface;
        get surface():volksoper.Surface {return this._surface;}
        set surface(surface: volksoper.Surface){
            if(this._surface){
               this._surface.release();
            }

            this._surface = surface;
            surface.addRef();
        }

        constructor(){
            super();

            var self = this;

            this.addEventListener(volksoper.Event.ADDED_TO_SCENE,(e)=>{
                self._scene = <volksoper.Scene>e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_SCENE,(e)=>{
                self._scene = null;
            });


            this.addEventListener(volksoper.Event.ADDED_TO_STAGE,(e)=>{
                self._stage = <volksoper.Stage>e.target;
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_STAGE,(e)=>{
                self._stage = null;
            });
        }


    }
}