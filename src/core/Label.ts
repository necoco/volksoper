
///<reference path="Surface.ts"/>

module volksoper{

    export class LabelImpl extends SurfaceImpl{
        text(text: string): void{}
        align(align: number): void{}
        lineGap(lineGap: number): void{}
        textColor(textColor: number): void{}
        font(font: Font): void{}
    }

    export class Label extends Surface{
        private _impl: LabelImpl;

        private _font: volksoper.Font;
        get font(): Font{
            return this._font;
        }
        set font(font: Font){
            this._font = font;
            if(this._impl){
                this._impl.font(font);
            }
        }

        private _align: number = 0;
        get align(): number{
            return this._align;
        }
        set align(align: number){
            this._align = align;
            if(this._impl){
                this._impl.align(align);
            }
        }

        private _lineGap: number = 0;
        get lineGap(): number{
            return this._lineGap;
        }
        set lineGap(lineGap: number){
            this._lineGap = lineGap;
            if(this._impl){
                this._impl.lineGap(lineGap);
            }
        }

        private _textColor: number = 0;
        get textColor(): number{
            return this._textColor;
        }
        set textColor(textColor: number){
            this._textColor = textColor;
            if(this._impl){
                this._impl.textColor(textColor);
            }
        }

        private _text: string;
        get text(): string{
            return this._text;
        }
        set text(text: string){
            this._text = text;
            if(this._impl){
                this._impl.text(text);
            }
        }

        get textWidth(): number{
            return 0;
        }

        get textHeight(): number{
            return 0;
        }

        _onStage(stage: Stage){
            if(!this._impl){
                this._impl = stage.topScene.dock.
                        _createLabelImpl(this.width, this.height, this.name);
                this._impl.font(this._font);
                this._impl.lineGap(this._lineGap);
                this._impl.align(this._align);
                this._impl.text(this._text);
                this._impl.textColor(this._textColor);
            }
        }

        constructor(width: number, height: number, name?: string){
            super(width, height, null, false, name);
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