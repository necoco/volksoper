

module volksoper{
    export class SoundImpl extends ResourceImpl{
        play(){throw new Error('unimplemented');}
        pause(){throw new Error('unimplemented');}
        loop(loop: bool){throw new Error('unimplemented')}
        stop(){throw new Error('unimplemented');}
    }

    export class Sound extends Resource{
        private _impl: SoundImpl;
        private _play = false;

        private _createImpl(stage: Stage){
            var impl = stage.currentScene.dock._createSoundImpl(this._src, this._play);
            impl.loop(this._loop);
            return impl;
        }

        play(){
            if(this._impl){
                this._impl.play();
            }else{
                this._play = true;
            }
        }

        stop(){
            if(this._impl){
                this._impl.stop();
            }else{
                this._play = false;
            }
        }

        pause(){
            if(this._impl){
                this._impl.pause();
            }else{
                this._play = false;
            }
        }

        private _loop = false;
        get loop(): bool{
            return this._loop;
        }
        set loop(loop: bool){
            if(this._impl){
                this._impl.loop(loop);
            }
            this._loop = loop;
        }

        attach(stage: Stage){
            this._setStage(stage);
            this.addRef();
        }

        constructor(private _src: string, stage?: Stage){
            super();

            if(stage){
                this.attach(stage);
            }
        }
    }
}