///<reference path="../jasmiine.d.ts"/>
///<reference path="../../src/core/Scene.ts"/>


module scene_spec{

    class MyActor extends volksoper.SceneNode{
        value = 0;
    }

    class MyActor1 extends MyActor{
        static group = "group1";
    }

    class MyActor2 extends MyActor{
        static group = ["group1", "group2"];
    }


    describe("Scene",()=>{
        var actor1: MyActor;
        var actor2: MyActor;
        var scene: volksoper.Scene;


        beforeEach(()=>{
            actor1 = new MyActor1();
            actor2 = new MyActor2();
            scene = new volksoper.Scene();

            scene.addChild(actor1);
            scene.addChild(actor2);
        })

        it("find group1", ()=>{
            scene.find("group1",(a: MyActor)=>{
                a.value++;
            });

            expect(actor1.value).toBe(1);
            expect(actor2.value).toBe(1);
        });

        it("find group2", ()=>{
            scene.find("group2",(a: MyActor)=>{
                a.value++;
            });

            expect(actor1.value).toBe(0);
            expect(actor2.value).toBe(1);
        });

        it("remove", ()=>{
            scene.removeChild(actor1);

            scene.find("group1", (a: MyActor)=>{
                a.value++;
            });

            expect(actor1.value).toBe(0);
            expect(actor2.value).toBe(1);
        });
    });
}