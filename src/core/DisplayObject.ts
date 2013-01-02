
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>


module volksoper{
    export class DisplayObject extends volksoper.Actor{
        private _dirty: bool = true;

        private _localMatrix: volksoper.Matrix4 = new volksoper.Matrix4();
        get localMatrix(): volksoper.Matrix4{
            var m = this._localMatrix;

            if(this._dirty){
                this._dirty = false;

                var px = this.pivotX || 0;
                var py = this.pivotY || 0;

                m
                        .identify()
                        .translate(px + this.x, py + this.y, 0)
                        .rotate(this.rotationX, this.rotationY, this.rotation)
                        .scale(this.scaleX, this.scaleY, 1)
                        .translate(-px, -py, 0);
            }

            return m;
        }

        _visitRendering(v: any){
            v.visitDisplayObject(this);
        }

        hitTestLocal(x: number,y :number): bool{
            return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
        }

        hitTest(x: number, y: number): bool{
            var localPos = this.globalToLocal(x, y);
            return this.hitTestLocal(localPos.x, localPos.y);
        }

        getWorldMatrix(m?: Matrix4): Matrix4{
            var p: any = this.parent;
            if(!m){
                m = new volksoper.Matrix4();
            }

            if(p && p.getWorldMatrix){
                p.getWorldMatrix(m);
            }

            m.multiply(this.localMatrix);

            return m;
        }

        globalToLocal(x: number, y: number){
            var mat = this.getWorldMatrix();
            var m = mat.m;

            if(mat.invert()){
                return {
                    x: x*m[0] + y*m[1] + m[3],
                    y: x*m[4] + y*m[5] + m[7]
                };
            }else{
                return {x: x, y: y};
            }
        }

        alpha: number = 1;
        touchEnabled: bool = true;
        
        private _x: number = 0;
        get x(): number{
            return this._x;
        }
        set x(value: number){
            this._x = value;
            this._dirty = true;
        }

        private _y: number = 0;
        get y(): number{
            return this._y;
        }
        set y(value: number){
            this._y = value;
            this._dirty = true;
        }
        
        private _z: number = 0;
        get z(): number{
            return this._z;
        }
        set z(value: number){
            this._z = value;
            this._dirty = true;
        }
        
        private _pivotX: number;
        get pivotX(): number{
            return this._pivotX;
        }
        set pivotX(value: number){
            this._pivotX = value;
            this._dirty = true;
        }

        private _pivotY: number;
        get pivotY(): number{
            return this._pivotY;
        }
        set pivotY(value: number){
            this._pivotY = value;
            this._dirty = true;
        }

        width: number = 0;
        height: number = 0;


        private _rotation: number = 0;
        get rotation(): number{
            return this._rotation;
        }
        set rotation(value: number){
            this._rotation = value;
            this._dirty = true;
        }
        private _rotationX: number = 0;
        get rotationX(): number{
            return this._rotationX;
        }
        set rotationX(value: number){
            this._rotationX = value;
            this._dirty = true;
        }
        private _rotationY: number = 0;
        get rotationY(): number{
            return this._rotationY;
        }
        set rotationY(value: number){
            this._rotationY = value;
            this._dirty = true;
        }


        private _scaleX: number = 1;
        get scaleX(): number{
            return this._scaleX;
        }
        set scaleX(value: number){
            this._scaleX = value;
            this._dirty = true;
        }
        
        private _scaleY: number = 1;
        get scaleY(): number{
            return this._scaleY;
        }
        set scaleY(value: number){
            this._scaleY = value;
            this._dirty = true;
        }

        visible: bool = true;
    }
}