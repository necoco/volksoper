
///<reference path="Actor.ts"/>
///<reference path="Surface.ts"/>
///<reference path="Resource.ts"/>


module volksoper{
    export class SceneDock extends volksoper.Actor{

        private _currentResource = 0;
        private _totalResource = 0;
        private _resourcePool = {};
        private _implPool = {};
        private _soundImplPool = {};

        get stage(){
            return this._stage;
        }


        constructor(private _stage: Stage, private _parentDock?: volksoper.SceneDock){
            super();
        }

        load(...files: string[]){
            var l = files.length;
            this._totalResource += l;
            for(var n = 0; n < l; ++n){
                this._loadResource(files[n]);
            }
        }

        _releaseResource(){
            for(var key in this._soundImplPool){
                var impl: SoundImpl = this._soundImplPool[key];
                impl.release();
            }

            this._soundImplPool = {};
        }

        private _loadResource(file: string): Resource{
            var ext = extractExt(file);
            var res: Resource = null;

            switch(ext){
                case 'jpg':case 'png':case 'jpeg':case 'gif':
                res = new Image(file);
                res.addUsableListener(this._createListener());
                break;
                case 'snd':case 'mp3':case 'ogg':case'wav':
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


        sound(name: string): Sound{
            return <Sound>this._resourcePool[name];
        }

        image(name: string): Image{
            return <Image>this._resourcePool[name];
        }

        private _findResource(name: string){
            var result = this._resourcePool[name];
            if(result){
                return result;
            }else if(this._parentDock){
                return this._parentDock._findResource(name);
            }

            return null;
        }

        _createImageImpl(src: string): ImageImpl{
            var impl = this._findImpl(src);
            if(impl){
                return impl;
            }else{
                impl = this._newImageImpl(src);
                this._implPool[src] = impl;

                return impl;
            }
        }

        private _newImageImpl(src: string): ImageImpl{
            throw new Error('unimplemented');
        }

        _createSoundImpl(src: string, autoPlay: bool): SoundImpl{
            var impl = this._findSoundImpl(src);
            if(impl){
                return impl;
            }else{
                impl = this._newSoundImpl(src, autoPlay);
                this._soundImplPool[src] = impl;

                return impl;
            }
        }

        private _findSoundImpl(name: string){
            var result = this._soundImplPool[name];
            if(result){
                return result;
            }else if(this._parentDock){
                return this._parentDock._findSoundImpl(name);
            }

            return null;
        }

        private _newSoundImpl(src: string, autoPlay: bool): SoundImpl{
            throw new Error('unimplemented');
        }

        _createSurfaceImpl(width: number, height: number,
                           renderer:any, primitive: bool, name: string): SurfaceImpl{
            var impl = this._findImpl(name);
            if(impl){
                return impl;
            }else{
                impl = this._newSurfaceImpl(width, height, renderer, primitive, name);
                this._implPool[impl.name()] = impl;

                return impl;
            }
        }

        private _findImpl(name: string){
            var result = this._implPool[name];
            if(result){
                return result;
            }else if(this._parentDock){
                return this._parentDock._findImpl(name);
            }

            return null;
        }

        private _newSurfaceImpl(width: number, height: number,
                                renderer:any, primitive: bool, name: string): SurfaceImpl{
            throw new Error('unimplemented');
        }

        _createLabelImpl(width: number, height: number, name: string): LabelImpl{
            var impl = this._findImpl(name);
            if(impl){
                return impl;
            }else{
                impl = this._newLabelImpl(width, height, name);
                this._implPool[impl.name()] = impl;

                return impl;
            }
        }

        private _newLabelImpl(width: number, height: number, name: string): LabelImpl{
            throw new Error('unimplemented');
        }
    }
}