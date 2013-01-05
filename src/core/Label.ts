
///<reference path="Surface.ts"/>

module volksoper{

    export class LabelImpl extends SurfaceImpl{
        text(text: string): void{throw new Error('unimplemented');}
        align(align: number): void{throw new Error('unimplemented');}
        lineGap(lineGap: number): void{throw new Error('unimplemented');}
        textColor(textColor: number): void{throw new Error('unimplemented');}
        font(font: Font): void{throw new Error('unimplemented');}
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

        _setStage(stage: Stage){
            super._setStage(stage);

            this._impl.font(this._font);
            this._impl.lineGap(this._lineGap);
            this._impl.align(this._align);
            this._impl.text(this._text);
            this._impl.textColor(this._textColor);
        }

        _createImpl(stage: Stage){
            return stage.topScene.dock._createLabelImpl(this._width, this._height, this._name);
        }

        constructor(private _width: number, private _height: number, private _name?: string){
            super(_width, _height, null, false, name);
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

    export module HorizontalAlign{
        export var CENTER: number = 0x1;
        export var LEFT: number = 0x2;
        export var RIGHT: number = 0x4;
    }

    export module VerticalAlign{
        export var CENTER: number = 0x10;
        export var TOP: number = 0x20;
        export var BOTTOM: number = 0x40;
    }

}