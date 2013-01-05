

module volksoper{

    export class ResourceImpl{
        private _listeners: any[] = [];

        private _usable = false;
        get usable(): bool{
            return this._usable;
        }

        private _fired = false;

        _setUsable(): void{
            if(!this._usable){
                this._usable = true;
                for(var n = 0; n < this._listeners.length;++n){
                    this._listeners[n](this);
                }

                this._listeners = null;
            }
        }

        _fireUsable(): void{
            if(this._listeners){
                for(var n = 0; n < this._listeners.length;++n){
                    this._listeners[n](this);
                }

                this._usable = true;
                this._fired = true;
            }
        }

        _setError(): void{
            for(var n = 0; n < this._listeners.length;++n){
                this._listeners[n](null);
            }

            this._usable = false;
            this._listeners = null;
        }

        addUsableListener(fn: (res: any)=>void){
            if(this._listeners && !this._fired){
                this._listeners.push(fn);
            }else{
                if(this._usable){
                    fn(this);
                }else{
                    fn(null);
                }
            }
        }

        private _referenceCount = 0;
        addRef(): number{
            return ++this._referenceCount;
        }
        release(): number{
            return --this._referenceCount;
        }
        name(): string{
            return this._name;
        }

        constructor(private _name?: string, prefix?: string){
            if(!_name){
                this._name = generateUniqueName(prefix);
            }
        }
    }

    export class Resource{
        private _impl: ResourceImpl;
        _getImpl(){
            return this._impl;
        }

        private _listeners: any[];

        addRef(): number{
            return this._impl.addRef();
        }
        release(): number{
            return this._impl.release();
        }
        get name(): string{
            return this._impl.name();
        }

        addUsableListener(fn: (res: any)=>void){
            if(this._impl){
                this._impl.addUsableListener(fn);
            }else{
                this._listeners = this._listeners || [];
                this._listeners.push(fn);
            }
        }

        _setStage(stage: Stage){
            if(!this._impl){
                this._impl = this._createImpl(stage);

                if(this._listeners){
                    for(var n = 0; n < this._listeners.length; ++n){
                        this._impl.addUsableListener(this._listeners[n]);
                    }

                    this._listeners = null;
                }
            }
        }

        applyProperties(props){
            if(!props) return;
            for(var key in props){
                this[key] = props[key];
            }
        }

        private _createImpl(stage: Stage): ResourceImpl{
            throw new Error('unimplemented');
        }
    }
}