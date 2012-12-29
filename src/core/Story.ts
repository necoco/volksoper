
module volksoper{
    export class Story{

        wait(event: string, ...args: string[]): volksoper.Story;
        wait(fn: () => any, ...args: any[]): volksoper.Story;
        wait(story: volksoper.Story): volksoper.Story;
        wait(...args: any[]): volksoper.Story{
            return this;
        }

        then(fn:() => void): volksoper.Story{
            return this;
        }

        waitEvent(name: string, source: Actor): volksoper.Story{
            return this;
        }

        tween(field: string, value: number, easing?: (t: number)=> number): volksoper.Story;
        tween(obj: Object): volksoper.Story{
            return this;
        }

        tweenBy(field: string, value: number, easing?: (t: number)=> number): volksoper.Story;
        tweenBy(obj: Object): volksoper.Story{
            return this;
        }

        call(methodName: string, ...args:any[]): volksoper.Story{
            return this;
        }

        get and(): volksoper.Story{
            return this;
        }
    }


}