
///<reference path="Actor.ts"/>
///<reference path="Surface.ts"/>
///<reference path="Resource.ts"/>


module volksoper{
    export class SceneDock extends volksoper.Actor{
        private _id = 0;
        get stage(){
            return this._stage;
        }


        constructor(private _stage: Stage, private _parentDock?: volksoper.SceneDock){
            super();
        }

        find(name: string): Resource{
            return null;
        }

        load(...files: string[]): Resource[]{
            return null;
        }

        play(name: string): bool{
            return false;
        }

        _createImageImpl(src: string): SurfaceImpl{
            return null;
        }

        _createSoundImpl(src: string, autoPlay: bool): SoundImpl{
            return null;
        }
    }
}