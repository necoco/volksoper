
module volksoper{
    var _ENGINES: any = {};

    export function createStage(options: any): Stage{
        var engine: any = options.engine;
        if(typeof engine === 'string'){
            return <Stage>new _ENGINES[engine](options);
        }else{
            for(var n = 0, el = engine.length; n < el; n++){
                try{
                    return <Stage>new _ENGINES[engine](options);
                }catch(e){}
            }
        }

        return null;
    }

    export function _registerEngine(name: string, engine: any){
        _ENGINES[name] = engine;
    }
}