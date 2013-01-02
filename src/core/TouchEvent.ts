
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="DisplayActor.ts"/>

module volksoper{
    export class TouchEvent extends volksoper.Event{
        static TOUCH_END = "touchEnd";
        static TOUCH_START = "touchStart";
        static TOUCH_MOVE = "touchMove";
        static TOUCH_CANCEL = "touchCancel";

        get x(){
            return this._x;
        }
        get y(){
            return this._y;
        }

        private _localPosition: any;
        get localX(){
            return (this._localPosition)? this._localPosition.x: this._getLocal().x;
        }
        get localY(){
            return (this._localPosition)? this._localPosition.y: this._getLocal().y;
        }

        get id(){
            return this._id;
        }

        private _getLocal(): any{
            if(this._currentTarget instanceof DisplayActor){
                this._localPosition = (<DisplayActor>this._currentTarget).globalToLocal(this._x, this._y);
            }else{
                this._localPosition = {x: this._x, y: this._y};
            }
            return this._localPosition;
        }

        private _currentTarget: volksoper.Actor;
        get currentTarget(): volksoper.Actor{
            return this._currentTarget;
        }
        set currentTarget(actor: volksoper.Actor){
            this._currentTarget = actor;
            this._localPosition = null;
        }

        constructor(type: string, private _x: number, private _y: number, private _id: number){
            super(type);
        }
    }
}