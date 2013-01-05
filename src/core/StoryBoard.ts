
///<reference path="Actor.ts"/>
///<reference path="Story.ts"/>


module volksoper{

    class StoryTimer{
        private _time: number = 0;

        setTime(time: number): void{
            this._time = time;
        }

        consume(time: number): number{
            if(this._time < time){
                this._time = 0;
                return this._time - time;
            }

            this._time -= time;
            return -1;
        }
    }


    export class StoryBoard{
        private _stories: volksoper.Story[] = [];
        private _timer: any = new StoryTimer();
        private _unregister: volksoper.Story[] = [];

        update(time: number): bool{
            this._unregister.splice(0);
            this._timer.setTime(time);

            for(var n = 0; n < this._stories.length; n++){
                this._stories[n]._update(this._timer);
            }

            //unregister stories
            for(var n = 0; n < this._unregister.length; ++n){
                this._stories.splice(this._stories.indexOf(this._unregister[n]), 1);
            }

            return this._stories.length === 0;
        }

        _registerStory(story: volksoper.Story){
            var index = this._unregister.indexOf(story);

            if(index >= 0){
                this._unregister.splice(index, 0);
            }else{
                this._stories.push(story);
            }
        }

        _unregisterStory(story: volksoper.Story){
            this._unregister.push(story);
        }

        story(hero?: volksoper.Actor): volksoper.Story{
            return new volksoper.Story(this, hero);
        }

        get numStories(): number{
            return this._stories.length;
        }
    }



}