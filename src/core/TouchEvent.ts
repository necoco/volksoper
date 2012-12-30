
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>

module volksoper{
    class TouchEvent extends volksoper.Event{

        private _currentTarget: volksoper.Actor;
        get currentActor(): volksoper.Actor{
            return this._currentTarget;
        }
        set currentActor(actor: volksoper.Actor){
            this._currentTarget = actor;

        }

        constructor(type: string){
            super(type);
        }
    }
}