
module volksoper{
    var _PLATFORM: Platform;
    var _AUDIO_CONTEXT: any;
    var _AUDIO_ELEMENT: HTMLMediaElement;

    export class Platform{
        get prefix(){
            return '';
        }
        
        constructor(){
            _AUDIO_ELEMENT = <HTMLMediaElement>document.createElement('audio');
        }

        requestAnimationFrame(fn, timeOut){
            if(window[this.prefix+'RequestAnimationFrame']){
                window[this.prefix+'RequestAnimationFrame'](fn);
            }else{
                (<any>window).setInterval(fn, timeOut);
            }
        }

        static instance(){
            if(!_PLATFORM){
                var ua = navigator.userAgent;
                if (ua.indexOf('Opera') >= 0) {
                    _PLATFORM =  new OperaPlatform();
                } else if (ua.indexOf('MSIE') >= 0) {
                    _PLATFORM = new MsPlatform();
                } else if (ua.indexOf('WebKit') >= 0) {
                    _PLATFORM = new WebkitPlatform();
                } else if (navigator.product === 'Gecko') {
                    _PLATFORM = new MozPlatform();
                } else {
                    _PLATFORM = new Platform();
                }
            }

            return _PLATFORM;
        }

        setTransformOrigin(e: any, value: string){
            e.style[this.prefix + 'TransformOrigin'] = value;
        }

        setTransform(e: any, value: string){
            e.style[this.prefix + 'Transform'] = value;
        }

        getSoundImplClass(): any{
            return DOMSoundImpl;
        }

        getWebAudioContext(){
            return null;
        }
        
        getPlayableSoundFormat(){
            if(_AUDIO_ELEMENT.canPlayType('audio/mp3')){
                return 'mp3';
            }else if(_AUDIO_ELEMENT.canPlayType('audio/ogg')){
                return 'ogg';
            }else if(_AUDIO_ELEMENT.canPlayType('audio/wav')){
                return 'wav';
            }

            return null;
        }
        
        isPlayableSoundFormat(src: string){
            return _AUDIO_ELEMENT.canPlayType('audio/' + extractExt(src));
        }

        canUseXHR(){
            return location.protocol !== 'file:';
        }

        isMobile(){
            return navigator.userAgent.indexOf('Mobile') >= 0;
        }
    }

    class WebkitPlatform extends Platform{
        get prefix(){
            return 'webkit';
        }

        getWebAudioContext(){
            if(!_AUDIO_CONTEXT){
                _AUDIO_CONTEXT = new ((<any>window).webkitAudioContext)();
            }

            return _AUDIO_CONTEXT;
        }

        getSoundImplClass():any{
            if(this.canUseXHR() && this.isMobile()){
                return WebAudioSoundImpl;
            }else{
                return DOMSoundImpl;
            }
        }
    }

    class MozPlatform extends Platform{
        get prefix(){
            return 'moz';
        }
    }

    class OperaPlatform extends Platform{
        get prefix(){
            return 'o';
        }
    }

    class MsPlatform extends Platform{
        get prefix(){
            return 'ms';
        }
    }
}