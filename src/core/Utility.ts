

module volksoper{
    var ID = 0;

    export function generateUniqueName(prefix: string): string{
        return "volksoper-" + prefix + "-" + (++ID).toString();
    }
}