
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>

module volksoper{

    export class Scene extends Actor{
        private _registry: Object = {};
        private _execFind = 0;
        private _unregister = [];

        constructor(){
            super();
            var self: Scene = this;

            var addedListener = (e: volksoper.Event)=>{
                self._registerTarget(e.target);
                e.target.removeEventListener(volksoper.Event.ADDED, addedListener);
            };

            var removeListener = (e: volksoper.Event)=>{
                self._unregisterTarget(e.target);
                e.target.removeEventListener(volksoper.Event.REMOVE, removeListener);
            };

            this.addEventListener(volksoper.Event.ADDED, addedListener, true, volksoper.SYSTEM_PRIORITY);
            this.addEventListener(volksoper.Event.REMOVE, removeListener, true, volksoper.SYSTEM_PRIORITY);
        }

        private _registerTarget(target): void {
            this._iterateTable(target,(a)=>{
                a.push(target);
            });
        }

        private _iterateTable(target: any, fn){
            var group = target.constructor.group;
            if(typeof group === 'string'){
                this._callbackGroup(group, fn);
            }else if(group instanceof Array){
                for(var n = 0; n < group.length; ++n){
                    this._callbackGroup(group[n], fn);
                }
            }
        }

        private _callbackGroup(group: string, fn){
            var table = this._registry[group];

            if(!table){
                this._registry[group] = table = [];
            }

            fn(table);
        }

        private _unregisterTarget(target: Actor): void {
            if(this._execFind === 0){
                this._iterateTable(target, (table)=>{
                    console.log(table.indexOf(target));
                    table.splice(table.indexOf(target), 1);
                });
            }else{
                this._iterateTable(target, (table)=>{
                    this._unregister = [table, target];
                });
            }
        }

        find(groupName: string, callback: (arg)=>void): void{
            this._execFind++;
            this._callbackGroup(groupName, (a)=>{
                var len = a.length;
                for(var n = 0; n < len; ++n){
                    callback(a[n]);
                }
            });

            this._execFind--;

            var r = this._unregister;
            var len = r.length;
            for(var n = 0; n < len; ++n){
                r[n][0].splice(r[n][0].indexOf(r[n][1]), 1);
            }
            r.splice(0);
        }
    }

}