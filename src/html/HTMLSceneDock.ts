
///<reference path="../core/SceneDock.ts/"/>

module volksoper{
    export class HTMLSceneDock extends SceneDock{
        constructor(parentDock?: SceneDock){
            super(parentDock);
        }

        find(name: string): Resource{
            return null;
        }

        private _currentResouce = 0;
        private _totalResource = 0;

        load(...files: string[]): Resource[]{
            var l = files.length;
            var result: Resource[] = [];
            for(var n = 0; n < l; ++n){
                result.push(this._loadResource(files[n]));
            }

            return result;
        }

        private _loadResource(file: string){
            var ext = this._extractExt(file);
            switch(ext){
                case 'jpg':case 'png':case 'jpeg':case 'gif':
                    this._totalResource++;
                    return new HTMLImage(file,(img)=>{
                        this.broadcastEvent(new volksoper.Event(volksoper.Event.LOADED), img);
                        this._currentResouce++;
                        if(this._currentResouce >= this._totalResource){
                            this.broadcastEvent(new volksoper.Event(volksoper.Event.COMPLETE));
                        }
                    });
            }
        }

        private _extractExt(path: string){
            var matched = path.match(/\.\w+$/);
            if (matched && matched.length > 0) {
                return matched[0].slice(1).toLowerCase();
            }
            return null;
        }

        play(name: string): bool{
            return false;
        }
    }
}