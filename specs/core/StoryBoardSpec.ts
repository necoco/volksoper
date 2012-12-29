
///<reference path="../jasmiine.d.ts"/>
///<reference path="../../src/core/Actor.ts/>
///<reference path="../../src/core/StoryBoard.ts"/>

module story_board_spec{

    export class MyActor extends volksoper.Actor{
        tl: number = 0;
        tl2: number = 0;
        called: bool = false;

        fn(){
            this.called = true;
        }
    }

    describe("Story", ()=>{
        var actor: story_board_spec.MyActor;
        var actor2: story_board_spec.MyActor;

        var board: volksoper.StoryBoard;

        beforeEach(()=>{
            actor = new MyActor();
            actor2 = new MyActor();
            board = new volksoper.StoryBoard();
        });

        it("wait event",()=>{
            var called = false;

            board.story(actor)
                    .wait("event")
                    .then(()=>{
                        called = true;
                    });

            actor.dispatchEvent(new volksoper.Event("event"));

            expect(called).toBeTruthy();
        });

        it("wait func", ()=>{
            var called1 = false;
            var called2 = false;

            board.story()
                    .wait(()=>{
                        called1 = true;
                    })
                    .then(()=>{
                        called2 = true;
                    });

            board.update(100000);

            expect(called1).toBeTruthy();
            expect(called2).toBeTruthy();
        });

        it("wait story", ()=>{
            var called1 = false;
            var called2 = false;

            var story = board.story(actor)
                    .then(()=>{
                        called1 = true;
                    });

            board.story()
                    .wait(story)
                    .then(()=>{
                        called2 = true;
                    });

            board.update(100000);

            expect(called1).toBeTruthy();
            expect(called2).toBeTruthy();
        });

        it("wait parallel", ()=>{
            var called1 = false;
            var called2 = false;
            var called3 = false;

            board.story(actor)
                    .wait(()=>{
                        called1 = true;
                    }, ()=>{
                        called2 = true;
                    })
                    .then(()=>{
                        called3 = true;
                    })

            board.update(100000);

            expect(called1 && called2 && called3).toBeTruthy();
        });

        it("wait event from another actor", ()=>{
            var called = false;

            board.story(actor)
                    .waitEvent("event", actor2)
                    .then(()=>{
                        called = true;
                    });

            actor2.dispatchEvent(new volksoper.Event("event"));

            expect(called).toBeTruthy();
        });

        it("call", ()=>{
            board.story(actor)
                    .call("fn");

            board.update(10000);

            expect(actor.called).toBeTruthy();
        });



        it("tween", ()=>{
            var called = false;

            board.story(actor)
                    .tween("tl", 10)
                    .then(()=>{
                        called = true;
                    });

            board.update(10000);

            expect(called).toBeTruthy();
            expect(actor.tl).toBe(10);
        });

        it("and", ()=>{
            var called = false;

            board.story(actor)
                    .tween("tl", 10).and
                    .tweenBy("tl2", 20)
                    .then(()=>{
                        called = true;
                    });

            board.update(10000);

            expect(called).toBeTruthy();
            expect(actor.tl).toBe(10);
            expect(actor.tl2).toBe(10);
        });
    });

}