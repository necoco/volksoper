
///<reference path="Event.ts"/>
///<reference path="Actor.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="DisplayActor.ts"/>
///<reference path="SceneDock.ts"/>


module volksoper{

    export class Scene extends volksoper.DisplayActor{
        private _registry: Object = {};
        private _execFind = 0;
        private _unregister = [];

        private _board: volksoper.StoryBoard = new volksoper.StoryBoard();
        get storyBoard(): volksoper.StoryBoard{
            return this._board;
        }

        private _stage: volksoper.Stage;
        get stage(): volksoper.Stage{
            return this._stage;
        }

        private _dock: SceneDock;
        get dock(){
            return this._dock;
        }

        private _setStage(){
            this._dock = this.stage._createSceneDock();
        }

        private _unsetStage(){
            this._dock = null;
        }

        addChild(child: Actor): void{
            if(child instanceof SceneNode){
                super.addChild(child);
            }else{
                throw Error("Scene can hold SceneNode only.");
            }
        }

        constructor(){
            super();

            this.addEventListener(volksoper.Event.ADDED, (e: volksoper.Event)=>{
                this._registerTarget(e.target);
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.ADDED_TO_SCENE), this);
            }, true, volksoper.SYSTEM_PRIORITY);

            this.addEventListener(volksoper.Event.REMOVE, (e: volksoper.Event)=>{
                e.target.broadcastEvent(new volksoper.Event(volksoper.Event.REMOVE_FROM_SCENE), this);
                this._unregisterTarget(e.target);
            }, true, volksoper.SYSTEM_PRIORITY);
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

            if(this._execFind === 0){
                var r = this._unregister;
                var len = r.length;
                for(var n = 0; n < len; ++n){
                    r[n][0].splice(r[n][0].indexOf(r[n][1]), 1);
                }
                r.splice(0);
            }
        }

        _visitRendering(v: any){
            v.visitScene(this);
        }

        _releaseResource(){
            this._dock._releaseResource();
        }
    }

}