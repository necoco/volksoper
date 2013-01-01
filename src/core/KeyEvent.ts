
///<reference path="Event.ts"/>

module volksoper{

    export class KeyEvent extends volksoper.Event{
        static KEY_DOWN = "keyDown";
        static KEY_UP = "keyUp";

        get keyCode(){
            return this._keyCode;
        }

        get keyName(){
            return this._keyName;
        }

        constructor(name: string, private _keyCode: number, private _keyName: string){
            super(name);
        }
    }
}
