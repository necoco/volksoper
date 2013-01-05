
module volksoper{
    export class CanvasLabelImpl extends LabelImpl{
        private _lines: string[] = [];
        private _lineWidth: number[] = [];
        private _totalHeight: number;

        private _text: string = '';
        text(text: string){
            this._text = text;
            this._measureText();
            this._measureHeight();
        }

        private _align: number = 0;
        align(align){
            this._align = align;
        }

        private _lineGap: number = 0;
        lineGap(lineGap){
            this._lineGap = lineGap;
            this._measureHeight();
        }

        private _font: string;
        private _fontSize: number;
        font(font: Font){
            this._font = '';

            if(font.italic){
                this._font += 'italic ';
            }
            if(font.bold){
                this._font += 'bold ';
            }
            if(font.size){
                this._font += font.size + 'px ';
                this._fontSize = font.size;
            }else{
                this._font += '14px ';
                this._fontSize = 14;
            }
            if(font.face){
                this._font += font.face + ' ';
            }else{
                this._font += 'serif ';
            }

            this._measureText();
            this._measureHeight();
        }

        private _color: string;
        textColor(color: number){
            this._color = toCSSColor(color);
        }

        private _measureHeight(){
            var l = this._lines.length;
            if(l === 0){
                this._totalHeight = 0;
            }else{
                this._totalHeight = l * this._fontSize + (l - 1) * this._lineGap;
            }
        }


        private _measureText(){
            var lines = this._text.replace(/\r\n/, "\n").split("\n");
            this._lines = [];
            this._lineWidth = [];
            this._context.font = this._font;

            for(var n = 0, ll = lines.length; n < ll; ++n){
                this._pushLine(lines[n]);
            }
        }

        private _pushLine(line: string){
            var buf = '', tmpBuf = '', lineWidth = 0;
            for(var n = 0, ll = line.length; n < ll; ++n){
                tmpBuf += line.charAt(n);
                if((lineWidth = this._context.measureText(tmpBuf).width) > this._width){
                    if(tmpBuf.length === 1){
                        // too short width
                        return;
                    }
                    this._lines.push(buf);
                    this._lineWidth.push(lineWidth);
                    n -= 1;
                    buf = '';
                    tmpBuf = '';
                }else{
                    buf = tmpBuf;
                }
            }
            if(buf.length > 0){
                this._lines.push(buf);
                this._lineWidth.push(lineWidth);
            }
        }

        width(){
            return this._width;
        }
        height(){
            return this._height;
        }
        name(){
            return this._name;
        }

        render(){
            var x = 0, y = 0;
            var align = this._align;

            if((align & VerticalAlign.CENTER) !== 0){
                y = (this._height - this._totalHeight) / 2;
            }else if((align & VerticalAlign.BOTTOM) !== 0){
                y = (this._height - this._totalHeight);
            }

            this._context.font = this._font;
            this._context.fillStyle = this._color;
            this._context.textBaseline = 'top';

            for(var n = 0, ll = this._lines.length; n < ll; ++n){
                if((align & HorizontalAlign.CENTER) !== 0){
                    x = (this._width - this._lineWidth[n]) / 2;
                }else if((align & HorizontalAlign.RIGHT) !== 0){
                    x = this._width - this._lineWidth[n];
                }else{
                    x = 0;
                }

                this._context.fillText(this._lines[n], x, y);

                y += this._fontSize + this._lineGap;
            }
        }

        constructor(private _width: number, private _height: number,
                    private _name: string, private _context: CanvasRenderingContext2D){
            super();

            if(this._name){
                this._name = generateUniqueName('label');
            }
        }
    }
}