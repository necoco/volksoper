
///<reference path="Surface.ts"/>

module volksoper{
    export class Label extends volksoper.Surface{
        font: volksoper.Font;
        mutable: bool = false;
        align: number = 0;
        lineGap: number = 0;
        textColor: number = 0;

        private _text: string;
        get text(): string{
            return this._text;
        }
        set text(text: string){
            this._text = text;
        }

        get textWidth(): number{
            return 0;
        }

        get textHeight(): number{
            return 0;
        }

        constructor(public width: number, public height: number){
            super();
        }
    }

    export class Font{
        constructor(
                public size?: number,
                public bold?: bool,
                public italic?: bool,
                public face?: string){
        }
    }

    export module VerticalAlign{
        var CENTER: number = 0x1;
        var LEFT: number = 0x2;
        var RIGHT: number = 0x4;
    }

    export module HorizontalAlign{
        var CENTER: number = 0x10;
        var TOP: number = 0x20;
        var BOTTOM: number = 0x40;
    }

}