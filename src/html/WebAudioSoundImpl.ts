module volksoper{
    export class WebAudioSoundImpl extends SoundImpl{
        _buffer: any;
        _bufferSrc: any;
        _autoPlay = false;

        constructor(private _src: string, autoPlay: bool){
            super();

            var platform = Platform.instance();
            var actx = platform.getWebAudioContext();
            var xhr = new XMLHttpRequest();
            var soundSrc = null;

            if(_src.slice(_src.length-3) === 'snd'){
                var withoutExt = _src.slice(0, _src.length-4);
                var playable = platform.getPlayableSoundFormat();
                soundSrc = withoutExt + playable;
            }else{
                soundSrc = _src;
            }

            xhr.responseType = 'arraybuffer';
            xhr.open('GET', soundSrc, true);
            xhr.onload = ()=> {
                actx.decodeAudioData(
                        xhr.response,
                        (buffer)=>{
                            this._buffer = buffer;
                            this._setUsable();
                            if(autoPlay || this._autoPlay){
                                this.play();
                            }
                        },
                        (error)=>{
                            this._setError();
                        }
                );
            };
            xhr.send(null);
        }

        play(){
            if(this._buffer){
                if(this._bufferSrc){
                    this._bufferSrc.disconnect();
                }
                var actx = Platform.instance().getWebAudioContext();
                this._bufferSrc = actx.createBufferSource();
                this._bufferSrc.buffer = this._buffer;
                this._bufferSrc.connect(actx.destination);
                this._bufferSrc.noteOn(0);
            }else{
                this._autoPlay = true;
            }
        }

        release(){
            var count = super.release();
            if(count <= 0 && this._bufferSrc){
                this._bufferSrc.disconnect();
            }
            return count;
        }

        name(){
            return this._src;
        }
    }
}