

module volksoper{
    export class SoundImpl extends ResourceImpl{
        play(){}
    }

    export class Sound extends Resource{
        private _impl: SoundImpl;

        private _createImpl(stage: Stage){
            return stage.topScene.dock._createSoundImpl(this._src);
        }

        private play(){
            if(this._impl){
                this._impl.play();
            }
        }

        attach(stage: Stage){
            this._setStage(stage);
        }

        constructor(private _src: string){
            super();
        }
    }
}