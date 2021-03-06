module volksoper{
    export class Event{
        static ADDED: string = "added";
        static REMOVE: string = "remove";

        static ADDED_TO_SCENE: string = "addedToScene";
        static REMOVE_FROM_SCENE: string = "removeFromScene";

        static ADDED_TO_STAGE: string = "addedToStage";
        static REMOVE_FROM_STAGE: string = "removeFromStage";

        static COMPLETE = "complete";
        static LOADED = "loaded";

        static LOADING_FAILED = "loadingFailed";

        static ENTER_FRAME = 'enterFrame';

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

        _reuse(){
            this._propagates = true;
            this._stopImmediate = false;
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