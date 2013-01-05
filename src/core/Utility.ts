

module volksoper{
    var ID = 0;

    export function generateUniqueName(prefix: string): string{
        return "volksoper-" + prefix + "-" + (++ID).toString();
    }

    export function extractExt(path: string): string{
        var matched = path.match(/\.\w+$/);
        if (matched && matched.length > 0) {
            return matched[0].slice(1).toLowerCase();
        }
        return null;
    }

    export function toCSSColor(color: number){
        var result = color.toString(16);

        for(var n = result.length; n < 6; ++n){
            result = '0' + result;
        }
        result = '#' + result;
        return result;
    }
}