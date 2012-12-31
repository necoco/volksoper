

module volksoper{
    export class Resource{
        private _listeners: any[] = [];

        private _usable = false;
        get usable(): bool{
            return this._usable;
        }

        _setUsable(): void{
            if(!this._usable){
                this._usable = true;
                for(var n = 0; n < this._listeners.length;++n){
                    this._listeners[n](this);
                }

                this._listeners = null;
            }
        }

        private addUsableListener(fn: (res: any)=>void){
            if(this._listeners){
                this._listeners.push(fn);
            }else{
                fn(this);
            }
        }
    }
}