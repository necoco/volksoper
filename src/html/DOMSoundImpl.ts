module volksoper{
    export class DOMSoundImpl extends SoundImpl{
        _element: HTMLMediaElement;

        name(){
            return this._src;
        }

        constructor(private _src: string){
            super();

            var type: string;

            var ext = extractExt(_src);

            var audio = <HTMLMediaElement>document.createElement('audio');

            audio.autoplay = false;
            audio.onerror = ()=>{
                this._setError();
            };

            if(ext === 'snd'){
                var withoutExt = _src.slice(_src.length - 4);
                if(audio.canPlayType('audio/mp3')){
                    audio.appendChild(this._createSource(withoutExt + '.mp3', 'audio/mp3'));
                }else if(audio.canPlayType('audio/ogg')){
                    audio.appendChild(this._createSource(withoutExt + '.ogg', 'audio/ogg'));
                }else if(audio.canPlayType('audio/wave')){
                    audio.appendChild(this._createSource(withoutExt + '.wav', 'audio/wave'));
                }
            }else{
                audio.appendChild(this._createSource(_src, 'audio/' + ext));
            }

            audio.load();
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
    }
}