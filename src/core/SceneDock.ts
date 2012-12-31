
///<reference path="Actor.ts"/>
///<reference path="Surface.ts"/>
///<reference path="Label.ts"/>
///<reference path="Resource.ts"/>


module volksoper{
    export class SceneDock extends volksoper.Actor{
        private _id = 0;


        constructor(private _parentDock: volksoper.SceneDock){
            super();
        }

        _generateName(): string{
            if(this._parentDock){
                return this._parentDock._generateName();
            }else{
                return "volksoper-" + (++this._id).toString();
            }
        }

        find(name: string): Resource{
            return null;
        }

        createFont(size?: number, bold?: bool, italic?: bool, face?: string): volksoper.Font{
            return null;
        }

        createLabel(width: number, height: number, name?: string): volksoper.Label{
            return null;
        }

        createSurface(width: number, height: number, renderer:(self: Surface, ctx: any)=>bool,
                      name?: string): volksoper.Surface{
            return null;
        }

        createPrimitiveSurface(width: number, height: number, renderer:(self: Surface, ctx: any)=>bool,
                      name?: string): volksoper.Surface{
            return null;
        }

        load(...files: string[]): Resource[]{
            return null;
        }

        copy(surface: volksoper.Surface): volksoper.Surface{
            return null;
        }
    }
}