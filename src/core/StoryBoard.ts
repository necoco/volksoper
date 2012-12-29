
///<reference path="Actor.ts"/>
///<reference path="Story.ts"/>

module volksoper{
    export class StoryBoard{
        static UPDATE_TICK: string = "tick";
        static UPDATE_TIME: string = "time";

        constructor(type?: string){

        }

        update(time: number): void{

        }

        story(hero?: volksoper.Actor): volksoper.Story{
            return null;
        }

        get numStories(): number{
            return 0;
        }
    }
}