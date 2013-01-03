

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
}