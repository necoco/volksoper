module volksoper{
    export class Event{
        static ADDED: string = "added";
        static REMOVE: string = "remove";

        currentTarget: Actor;
        target: Actor;

        get type(): string{
            return this._type;
        }

        private _propagates: bool = true;
        get propagates(): bool{
            return this._propagates;
        }

        private _stopImmediate: bool = false;
        get stopImmediate(): bool{
            return this._stopImmediate;
        }

        constructor(private _type: string){
        }

        stopPropagation(): void{
            this._propagates = false;
        }

        stopPropagationImmediate(): void{
            this._propagates = false;
            this._stopImmediate = true;
        }


    }
}