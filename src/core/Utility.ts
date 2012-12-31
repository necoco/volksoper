

module volksoper{
    var ID = 0;

    export function generateUniqueName(): string{
        return "volksoper-" + (++ID).toString();
    }
}