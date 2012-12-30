
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>

module volksoper{
    export class TouchEvent extends volksoper.Event{
        private static TMP_MAT: Matrix4 = new Matrix4();
        private static TMP_IN: number[] = [0,0,0,1];
        private static TMP_OUT: number[] = [0,0,0,1];

        get x(){
            return this._x;
        }
        get y(){
            return this._y;
        }

        private _localX = 0;
        get localX(){
            return this._localX;
        }
        private _localY = 0;
        get localY(){
            return this._localY;
        }

        private _currentTarget: volksoper.Actor;
        get currentTarget(): volksoper.Actor{
            return this._currentTarget;
        }
        set currentTarget(actor: volksoper.Actor){
            this._currentTarget = actor;

            var i = TouchEvent.TMP_IN;
            var o = TouchEvent.TMP_OUT;
            var m = TouchEvent.TMP_MAT;

            if(actor instanceof volksoper.DisplayObject){
                (<volksoper.DisplayObject>actor).getWorldMatrix(m);

                i[0] = this._x;
                i[1] = this._y;

                m.multiplyVector(i, o);

                this._localX = o[0];
                this._localY = o[1];
            }else{
                this._localX = null;
                this._localY = null;
            }
        }

        constructor(type: string, private _x: number, private _y: number){
            super(type);
        }
    }
}