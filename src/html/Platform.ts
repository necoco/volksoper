
module volksoper{
    var _PLATFORM: Platform;

    export class Platform{
        get prefix(){
            return '';
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
    }

    class WebkitPlatform extends Platform{
        get prefix(){
            return 'webkit';
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