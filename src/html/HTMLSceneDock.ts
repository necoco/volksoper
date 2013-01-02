
///<reference path="../core/SceneDock.ts/"/>

module volksoper{
    export class HTMLSceneDock extends SceneDock{
        constructor(stage: Stage, private _parentDock?: SceneDock){
            super(stage, _parentDock);
        }

        find(name: string): Resource{
            return null;
        }

        private _currentResouce = 0;
        private _totalResource = 0;

        private _surfaceImpls: any = {};

        load(...files: string[]): Resource[]{
            var l = files.length;
            var result: Resource[] = [];
            for(var n = 0; n < l; ++n){
                result.push(this._loadResource(files[n]));
            }

            return result;
        }

        private _loadResource(file: string): Resource{
            var ext = this._extractExt(file);
            var res: Resource = null;
            switch(ext){
                case 'jpg':case 'png':case 'jpeg':case 'gif':
                    this._totalResource++;
                    res = new Picture(file);
                    res.addUsableListener((img)=>{
                        if(img){
                            this.broadcastEvent(new volksoper.Event(volksoper.Event.LOADED), img);
                            this._currentResouce++;
                            if(this._currentResouce >= this._totalResource){
                                this.broadcastEvent(new volksoper.Event(volksoper.Event.COMPLETE));
                            }
                        }else{
                            this.broadcastEvent(new volksoper.Event(volksoper.Event.LOADING_FAILED));
                        }
                    });
                    break;
            }

            return res;
        }

        private _extractExt(path: string): string{
            var matched = path.match(/\.\w+$/);
            if (matched && matched.length > 0) {
                return matched[0].slice(1).toLowerCase();
            }
            return null;
        }

        _createImageImpl(src: string): SurfaceImpl{
            var impl = this._findImageImpl(src);
            if(impl){
                return impl;
            }else{
                impl = this._newImageImpl(src);
                this._surfaceImpls[src] = impl;
                return impl;
            }
        }

        private _newImageImpl(src: string): SurfaceImpl{
            return new HTMLImageImpl(src);
        }

        private _findImageImpl(name: string): SurfaceImpl{
            var impl = this._surfaceImpls[name]
            if(!impl && this._parentDock){
                return (<HTMLSceneDock>this._parentDock)._findImageImpl(name);
            }
            return null;
        }

        play(name: string): bool{
            return false;
        }
    }
}