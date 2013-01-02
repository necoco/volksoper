
module volksoper{
    export class Platform{
        get prefix(){
            return '';
        }

        static create(){
            var ua = navigator.userAgent;
            if (ua.indexOf('Opera') >= 0) {
                return new OperaPlatform();
            } else if (ua.indexOf('MSIE') >= 0) {
                return new MsPlatform();
            } else if (ua.indexOf('WebKit') >= 0) {
                return new WebkitPlatform();
            } else if (navigator.product === 'Gecko') {
                return new MozPlatform();
            } else {
                return new Platform();
            }
        }

        setTransformOrigin(e: any, value: string){
            e.style[this.prefix + 'TransformOrigin'] = value;
        }

        setTransform(e: any, value: string){
            e.style[this.prefix + 'Transform'] = value;
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