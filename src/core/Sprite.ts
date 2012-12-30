
///<reference path="Actor.ts"/>
///<reference path="Scene.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="Story.ts"/>

module volksoper{
    export class Sprite extends Actor{
        alpha: number = 1;

        x: number = 0;
        y: number = 0;
        z: number = 0;

        pivotX: number;
        pivotY: number;

        width: number = 0;
        height: number = 0;

        rotation: number = 0;
        rotationX: number = 0;
        rotationY: number = 0;

        scaleX: number = 1;
        scaleY: number = 1;

        visible: bool = true;

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