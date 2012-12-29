
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>

module volksoper{

    export class Scene extends Actor{
        private _wrapper: Object = {};
        private _registry: Object = {};

        constructor(){
            super();
            var self: Scene = this;
            this.addEventListener(volksoper.Event.ADDED,
                    (e: volksoper.Event)=>{self._registerTarget(e.target);}, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE,
                    (e: volksoper.Event)=>{self._unregisterTarget(e.target);}, true);
        }

        private _registerTarget(target): void {
            this._getTable(target).push(target);
            this._registerWrapper(target);
        }

        private _registerWrapper(target){
            var wrapper = this._wrapper[target.prototype.constructor];
            var table = this._getTable(target);

            if(!wrapper){
                wrapper = Scene._createWrapper(target, table);
                this._wrapper[target.prototype.constructor] = wrapper;
            }
        }

        private static _createWrapper(target, table){
            var wrapper = {};
            for(var key in target){
                var body = target[key];
                if(typeof body === 'function'){
                    wrapper[key] = Scene._wrapMethod(table, key, wrapper);
                }
            }

            return wrapper;
        }

        private static _wrapMethod(table, key, wrapper){
            return ()=>{
                for(var index in table){
                    table[index][key].apply(table[index], arguments);
                }

                return wrapper;
            }
        }

        private _getTable(target){
            var table: any[] = this._registry[target.prototype.constructor];

            if(!table){
                this._registry[target.prototype.constructor] = table = [];
            }

            return table;
        }

        private _unregisterTarget(target: Actor): void {
            var table: any[] = this._getTable(target);
            table.splice(table.indexOf(target), 1);
        }

        find(targetClass): any[]{
            return this._registry[targetClass] = this._registry[targetClass] || [];
        }

        query(targetClass):any{
            return this._wrapper[targetClass];
        }
    }

}