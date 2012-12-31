
///<reference path="Actor.ts"/>
///<reference path="StoryBoard.ts"/>
///<reference path="Easing.ts"/>




module volksoper{


    function CompositeScenario(callback: ()=> void){
        var scenarios: any[] = [];

        return (timer, scenario)=>{
            if(scenario){
                scenarios.push(scenario);
                return false;
            }
            while(scenarios.length != 0){
                if(scenarios[0](timer)){
                    return true;
                }else{
                    scenarios.shift();
                }
            }

            if(callback)callback();
            return false;
        }
    }

    function WaitFunc(fn: ()=>any){
        return ()=>{
            fn();
        }
    }

    function ParallelScenario(){
        var scenarios: any[] = [];

        return (timer, scenario)=>{
            if(scenario){
                scenarios.push(scenario);
                return false;
            }
            for(var n = 0; n < scenarios.length; ++n){
                if(!scenarios[n](timer)){
                    scenarios.splice(n, 1);
                    n -= 1;
                }
            }

            return scenarios.length !== 0;
        }
    }


    function WaitEvent(event: string, source: volksoper.Actor){
        var called = false;
        var listener = (ev)=>{
            source.removeEventListener(event, listener);
            called = true;
        }

        source.addEventListener(event, listener);

        return ()=>{
            return !called;
        }
    }


    function Tween(target: any, dst: Object, time: number, easing: (t,b,c,d)=>number){
        var src = {};
        var currentTime = 0;
        for(var key in dst){
            src[key] = target[key];
        }

        return (timer)=>{
            var consumed = timer.consume(time - currentTime);
            var key: string = null;

            if(consumed >= 0){
                currentTime += consumed;
                for(key in dst){
                    target[key] = easing(currentTime, src[key], dst[key], time);
                }
                return true;
            }else{
                for(key in dst){
                    target[key] = dst[key];
                }
                return false;
            }
        }
    }

    function Then(fn: ()=>void){
        return ()=>{
            fn();
            return false;
        }
    }

    export class Story{

        private _scenario: any;
        private _and: any;
        private _state: string = "normal";

        private _createScenario(): void{
            if(!this._scenario){
                this._board._registerStory(this);
                var self = this;
                this._scenario = CompositeScenario(()=>{
                    self._scenario = null;
                    self._board._unregisterStory(self);
                });
            }
        }

        private _addScenario(s: any): void{
            this._createScenario();

            switch(this._state){
                case "normal":
                    this._scenario(null, s);
                    break;
                case "and":
                    this._and(null, s);
                    this._state = "unknown";
                    break;
                case "unknown":
                    this._scenario(null, s);
                    this._state = "normal";
                    break;
            }
        }

        wait(event: string, ...args: any[]): volksoper.Story;
        wait(fn: () => any, ...args: any[]): volksoper.Story;
        wait(story: volksoper.Story, ...args: any[]): volksoper.Story;
        wait(): volksoper.Story{
            var scenario: any = ParallelScenario();

            for(var n = 0; n < arguments.length; ++n){
                var b = arguments[n];

                if(typeof b === 'string'){
                    scenario(null, WaitEvent(b, this._hero));
                }else if(b instanceof volksoper.Story){
                    scenario(null, b._scenario);
                }else{
                    scenario(null, WaitFunc(b));
                }
            }

            this._addScenario(scenario);

            return this;
        }

        constructor(private _board: volksoper.StoryBoard, private _hero: volksoper.Actor){

        }

        then(fn:() => void): volksoper.Story{
            this._addScenario(Then(fn));
            return this;
        }

        waitEvent(name: string, source: Actor): volksoper.Story{
            this._addScenario(WaitEvent(name, source));
            return this;
        }

        private _createTween(dstManip, target: volksoper.Actor, args: any){
            var easing;
            var dst;
            var time;

            if(args.length == 1){
                var obj = args[0];
                easing = obj.easing || volksoper.Easing.LINEAR;
                delete obj.easing;
                time = obj.time || 1;
                delete obj.time;
                dst = obj;
            }else{
                easing = args[2] || volksoper.Easing.LINEAR;
                dst = {};
                dst[args[0]] = args[1];
            }

            if(dstManip)dst = dstManip(dst);

            this._addScenario(Tween(target, <Object>dst, time, easing));
        }

        tween(field: string, value: number, easing?: (t: number)=> number): volksoper.Story;
        tween(obj: Object): volksoper.Story{
            this._createTween(null, this._hero, arguments);
            return this;
        }

        tweenBy(field: string, value: number, easing?: (t: number)=> number): volksoper.Story;
        tweenBy(obj: Object): volksoper.Story{
            this._createScenario();

            var hero = this._hero;

            this._createTween((o)=>{
                for(var key in o){
                    o[key] = o[key] + hero[key];
                }
                return o;
            }, hero, arguments);
            return this;
        }

        call(methodName: string, ...args:any[]): volksoper.Story{
            this._createScenario();

            var hero = this._hero;
            this._addScenario(()=>{
                hero[methodName].apply(hero, args);
                return false;
            })

            return this;
        }

        get and(): volksoper.Story{
            switch(this._state){
                case "normal":
                    this._and = CompositeScenario(null);
                    break;
                case "and":
                    break;
                case "unknown":
                    this._state = "and";
                    break;
            }

            return this;
        }

        _update(timer: any){
            this._scenario(timer);
        }
    }

}