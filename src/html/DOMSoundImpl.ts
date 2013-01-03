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
                var withoutExt = _src.slice(0, _src.length - 4);
                var playable = Platform.instance().getPlayableSoundFormat();
                audio.appendChild(this._createSource(withoutExt+playable, 'audio/'+playable));
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