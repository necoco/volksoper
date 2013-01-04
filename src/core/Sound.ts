

module volksoper{
    export class SoundImpl extends ResourceImpl{
        play(){}
    }

    export class Sound extends Resource{
        private _impl: SoundImpl;
        private _play = false;

        private _createImpl(stage: Stage){
            return stage.topScene.dock._createSoundImpl(this._src, this._play);
        }

        play(){
            if(this._impl){
                this._impl.play();
            }else{
                this._play = true;
            }
        }

        attach(stage: Stage){
            this._setStage(stage);
            this.addRef();
        }

        constructor(private _src: string){
            super();
        }
    }
}