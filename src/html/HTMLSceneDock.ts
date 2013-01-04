
///<reference path="../core/SceneDock.ts/"/>

module volksoper{
    export class HTMLSceneDock extends SceneDock{
        constructor(stage: Stage, private _parentDock?: HTMLSceneDock){
            super(stage, _parentDock);
        }

        find(name: string): Resource{
            return this._resourcePool[name];
        }

        private _currentResource = 0;
        private _totalResource = 0;
        private _resourcePool = {};

        private _surfaceImpls: any = {};
        private _soundImpls: any = {};

        load(...files: string[]): Resource[]{
            var l = files.length;
            var result: Resource[] = [];
            for(var n = 0; n < l; ++n){
                result.push(this._loadResource(files[n]));
            }

            return result;
        }

        release(...files: string[]){
            for(var n = 0; n < files.length; ++n){
                var res = <Resource>this._resourcePool[files[n]];
                res.release();
                delete this._resourcePool[files[n]];
            }
        }

        _releaseResource(){
            for(var key in this._resourcePool){
                var res = <Resource>this._resourcePool[key];
                res.release();
            }
            this._resourcePool = {};
        }

        private _loadResource(file: string): Resource{
            var ext = extractExt(file);
            var res: Resource = null;
            switch(ext){
                case 'jpg':case 'png':case 'jpeg':case 'gif':
                    this._totalResource++;
                    res = new Image(file);
                    res.addUsableListener(this._createListener());
                    break;
                case 'snd':case 'mp3':case 'ogg':case'wav':
                    this._totalResource++;
                    res = new Sound(file);
                    (<Sound>res).attach(this.stage);
                    res.addUsableListener(this._createListener());
                    break;
            }

            this._resourcePool[file] = res;

            return res;
        }

        private _createListener(){
            return (res)=>{
                if(res){
                    this.broadcastEvent(new volksoper.Event(volksoper.Event.LOADED), res);
                    this._currentResource++;
                    if(this._currentResource >= this._totalResource){
                        this.broadcastEvent(new volksoper.Event(volksoper.Event.COMPLETE));
                    }
                }else{
                    this.broadcastEvent(new volksoper.Event(volksoper.Event.LOADING_FAILED));
                }
            };
        }

        _createImageImpl(src: string): SurfaceImpl{
            var impl = this._findImageImpl(src);
            if(impl){
                return impl;
            }else{
                impl = this._newImageImpl(src);
                this._surfaceImpls[src] = impl;
                impl.addRef();
                return impl;
            }
        }

        private _newImageImpl(src: string): SurfaceImpl{
            return new HTMLImageImpl(src);
        }

        private _findImageImpl(name: string): SurfaceImpl{
            var impl = this._surfaceImpls[name]
            if(!impl && this._parentDock){
                return this._parentDock._findImageImpl(name);
            }
            return null;
        }

        play(name: string): bool{
            if(this._soundImpls[name]){
                this._soundImpls[name].play();
                return true;
            }
            return false;
        }

        _createSoundImpl(src: string, autoPlay: bool): SoundImpl{
            var impl = this._findSoundImpl(src);
            if(impl){
                return impl;
            }else{
                impl = new (Platform.instance().getSoundImplClass())(src, autoPlay);
                this._soundImpls[src] = impl;
                impl.addRef();
                return impl;
            }
        }

        private _findSoundImpl(name: string): SoundImpl{
            var impl = this._soundImpls[name]
            if(!impl && this._parentDock){
                return this._parentDock._findSoundImpl(name);
            }
            return null;
        }
    }
}