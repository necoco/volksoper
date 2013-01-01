
///<reference path="Actor.ts"/>
///<reference path="Surface.ts"/>
///<reference path="Label.ts"/>
///<reference path="Resource.ts"/>


module volksoper{
    export class SceneDock extends volksoper.Actor{
        private _id = 0;


        constructor(private _parentDock?: volksoper.SceneDock){
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
    }
}