module volksoper{
    export class DOMSoundImpl extends SoundImpl{
        _element: HTMLMediaElement;

        name(){
            return this._src;
        }

        constructor(private _src: string, autoPlay: bool){
            super(_src);

            var ext = extractExt(_src);

            var audio = <HTMLMediaElement>document.createElement('audio');

            audio.autoplay = false;
            audio.onerror = ()=>{
                this._setError();
            };

            if(ext === 'snd'){
                var withoutExt = _src.slice(0, _src.length - 4);
                var playable = Platform.instance().getPlayableSoundFormat();
                audio.appendChild(this._createSource(withoutExt+playable, 'audio/'+playable));
            }else{
                audio.appendChild(this._createSource(_src, 'audio/' + ext));
            }

            audio.load();
            if(autoPlay){
                audio.play();
            }
            this._element = audio;

            this._fireUsable();
        }

        private _createSource(src: string, mime:string){
            var srcElement: any = document.createElement('source');
            srcElement.src = src;
            srcElement.type = mime;

            return srcElement;
        }

        play(){
            this._element.play();
        }

        stop(){
            this._element.pause();
            this._element.currentTime = 0;
        }

        pause(){
            this._element.pause();
        }

        loop(loop){
            this._element.loop = loop;
        }
    }
}