
//http://www.robertpenner.com/easing/

module volksoper{
    export module Easing{
        export function LINEAR(t: number, b: number, c: number, d: number): number{
            return c * t / d + b;
        }

        export function SWING(t: number, b: number, c: number, d: number): number{
            return c * (0.5 - Math.cos(((t / d) * Math.PI)) / 2) + b;
        }

        export function QUAD_EASEIN(t: number, b: number, c: number, d: number): number{
            return c * (t /= d) * t + b;
        }
        export function QUAD_EASEOUT(t: number, b: number, c: number, d: number): number{
            return -c * (t /= d) * (t - 2) + b;
        }
        export function QUAD_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
        export function CUBIC_EASEIN(t: number, b: number, c: number, d: number): number{
            return c * (t /= d) * t * t + b;
        }
        export function CUBIC_EASEOUT(t: number, b: number, c: number, d: number): number{
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
        export function CUBIC_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
        export function QUART_EASEIN(t: number, b: number, c: number, d: number): number{
            return c * (t /= d) * t * t * t + b;
        }
        export function QUART_EASEOUT(t: number, b: number, c: number, d: number): number{
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
        export function QUART_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
        export function QUINT_EASEIN(t: number, b: number, c: number, d: number): number{
            return c * (t /= d) * t * t * t * t + b;
        }
        export function QUINT_EASEOUT(t: number, b: number, c: number, d: number): number{
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        }
        export function QUINT_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
        export function SIN_EASEIN(t: number, b: number, c: number, d: number): number{
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        }
        export function SIN_EASEOUT(t: number, b: number, c: number, d: number): number{
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        }
        export function SIN_EASEINOUT(t: number, b: number, c: number, d: number): number{
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
        export function CIRC_EASEIN(t: number, b: number, c: number, d: number): number{
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        }
        export function CIRC_EASEOUT(t: number, b: number, c: number, d: number): number{
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        }
        export function CIRC_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d / 2) < 1) {
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            }
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
        export function ELASTIC_EASEIN(t: number, b: number, c: number, d: number): number{
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }

            var p = d * 0.3;

            var a = c;
            var s = p / 4;

            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
       }
        export function ELASTIC_EASEOUT(t: number, b: number, c: number, d: number): number{
            if (t === 0) {
                return b;
            }
            if ((t /= d) === 1) {
                return b + c;
            }
            var p = d * 0.3;

            var a = c;
            var s = p / 4;

            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        }
        export function ELASTIC_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) === 2) {
                return b + c;
            }
            var p = d * (0.3 * 1.5);
            var a = c;
            var s = p / 4;

            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        }
        export function BOUNCE_EASEIN(t: number, b: number, c: number, d: number): number{
            return c - volksoper.Easing.BOUNCE_EASEOUT(d - t, 0, c, d) + b;
        }

        export function BOUNCE_EASEOUT(t: number, b: number, c: number, d: number): number{
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
            }
        }
        export function BOUNCE_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if (t < d / 2) {
                return volksoper.Easing.BOUNCE_EASEIN(t * 2, 0, c, d) * 0.5 + b;
            } else {
                return volksoper.Easing.BOUNCE_EASEOUT(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        }
        export function BACK_EASEIN(t: number, b: number, c: number, d: number): number{
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        }
        export function BACK_EASEOUT(t: number, b: number, c: number, d: number): number{
            var s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
        export function BACK_EASEINOUT(t: number, b: number, c: number, d: number): number{
            var s = 1.70158;
            if ((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
        export function EXPO_EASEIN(t: number, b: number, c: number, d: number): number{
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        }
        export function EXPO_EASEOUT(t: number, b: number, c: number, d: number): number{
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }
        export function EXPO_EASEINOUT(t: number, b: number, c: number, d: number): number{
            if (t === 0) {
                return b;
            }
            if (t === d) {
                return b + c;
            }
            if ((t /= d / 2) < 1) {
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            }
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    }
}