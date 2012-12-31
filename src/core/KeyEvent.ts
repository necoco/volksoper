
///<reference path="Event.ts"/>

module volksoper{

    class KeyEvent extends volksoper.Event{
        static KEY_DOWN = "keyDown";
        static KEY_UP = "keyUp";

        get keyCode(): number{
            return this._keyCode;
        }

        constructor(name: string, private _keyCode: number){
            super(name);
        }
    }
}
