
///<reference path="Actor.ts"/>
///<reference path="Matrix4.ts"/>

declare class Stage{}

module volksoper{
    export class DisplayActor extends volksoper.Actor{
        private _dirtyFlag: bool = true;
        get _dirty(): bool{
            return this._dirtyFlag;
        }
        set _dirty(dirty: bool){
            this._dirtyFlag = dirty;
        }

        private _stage: volksoper.Stage;
        get stage(): volksoper.Stage{
            return this._stage;
        }
        private _setStage(){}
        private _unsetStage(){}

        constructor(){
            super();

            this.addEventListener(volksoper.Event.ADDED_TO_STAGE,(e)=>{
                this._stage = <Stage>e.target;
                this._setStage();
            }, false, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE_FROM_STAGE,(e)=>{
                this._unsetStage();
                this._stage = null;
            }, false, volksoper.SYSTEM_PRIORITY);
        }

        private _localMatrix: volksoper.Matrix4 = new volksoper.Matrix4();
        get localMatrix(): volksoper.Matrix4{
            var m = this._localMatrix;

            if(this._dirty){
                this._dirty = false;

                var px = this.pivotX || 0;
                var py = this.pivotY || 0;

                m
                        .identify()
                        .translate(px + this.x, py + this.y, this.z)
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
            if(!this.width || !this.height)return false;
            if(this._hitArea){
                return this._left <= x && x <= this._right && this._top <= y && y <= this._bottom;
            }else{
                return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
            }
        }

        private _hitArea = false;
        private _left: number;
        private _top: number;
        private _right: number;
        private _bottom: number;
        setHitArea(left: number, top: number, right: number, bottom: number){
            this._hitArea = true;
            this._left = left;
            this._top = top;
            this._right = right;
            this._bottom = bottom;
        }

        clearHitArea(){
            this._hitArea = false;
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
                    x: x*m[0] + y*m[4] + m[12],
                    y: x*m[1] + y*m[5] + m[13]
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

        width: number;
        height: number;


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