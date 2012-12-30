
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

        alpha: number = 1;
        
        private _x: number;
        get x(): number{
            return this._x;
        }
        set x(value: number){
            this._x = value;
            this._dirty = true;
        }

        private _y: number;
        get y(): number{
            return this._y;
        }
        set y(value: number){
            this._y = value;
            this._dirty = true;
        }
        
        private _z: number;
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


        private _rotation: number;
        get rotation(): number{
            return this._rotation;
        }
        set rotation(value: number){
            this._rotation = value;
            this._dirty = true;
        }
        private _rotationX: number;
        get rotationX(): number{
            return this._rotationX;
        }
        set rotationX(value: number){
            this._rotationX = value;
            this._dirty = true;
        }
        private _rotationY: number;
        get rotationY(): number{
            return this._rotationY;
        }
        set rotationY(value: number){
            this._rotationY = value;
            this._dirty = true;
        }


        private _scaleX: number;
        get scaleX(): number{
            return this._scaleX;
        }
        set scaleX(value: number){
            this._scaleX = value;
            this._dirty = true;
        }
        
        private _scaleY: number;
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