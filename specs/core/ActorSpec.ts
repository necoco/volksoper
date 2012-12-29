///<reference path="../jasmine.d.ts"/>
///<reference path="../../src/core/Actor.ts"/>


class MyActor extends volksoper.Actor{
    priority: number;
    added: bool;
    remove: bool;
    event: bool;

    onAdded(){
        this.added = true;
    }

    onRemove(){
        this.remove = true;
    }

    onEvent(){
        this.event = true;
    }
}

describe("Actor",()=>{
    var parent: MyActor;
    var child1: MyActor;
    var child2: MyActor;

    beforeEach(()=>{
        parent = new MyActor();
        child1 = new MyActor();
        child2 = new MyActor();
    });

    it("topChild", ()=>{
        parent.addChild(child1);
        expect(child1).toEqual(parent.topChild);
    });

    it("popChild", ()=>{
        parent.addChild(child1);
        expect(child1).toEqual(parent.popChild());
    });

    it("removeChild", ()=>{
        parent.addChild(child1);
        expect(parent.removeChild(child1)).toBeTruthy();
        expect(0).toBe(parent.numChildren);
    });

    it("sortChildren", ()=>{
        child1.priority = 2;
        parent.addChild(child1);

        child2.priority = 1;
        parent.addChild(child2);

        parent.sortChildren((a1, a2)=>{
            return (<MyActor>a1).priority - (<MyActor>a2).priority;
        });

        expect(child2).toEqual(parent.getChild(0));
        expect(child1).toEqual(parent.getChild(1));
    });

    it("addEventListener, propagateEvent", ()=>{
        var called: bool = false;
        parent.addChild(child1);

        parent.addEventListener("event", (ev)=>{
            called = true;
        });

        child1.propagateEvent(new volksoper.Event("event"));

        expect(called).toBeTruthy();
    });

    it("removeEventListener", ()=>{
        var called: bool = false;
        var fn;
        parent.addChild(child1);

        parent.addEventListener("event", fn = (ev)=>{
            called = true;
        });
        parent.removeEventListener("event", fn);
        child1.propagateEvent(new volksoper.Event("event"));

        expect(called).toBeFalsy();
    });

    it("dispatchEvent", ()=>{
        parent.addChild(child1);
        child1.dispatchEvent(new volksoper.Event("event"));

        expect(parent.event).toBeFalsy();
        expect(child1.event).toBeTruthy();
    });

    it("broadcastEvent", ()=>{
        parent.addChild(child1);

        parent.broadcastEvent(new volksoper.Event("event"));

        expect(child1.event).toBeTruthy();
    });

    it("addEventListener, capture", ()=>{
        var called: bool = false;
        parent.addChild(child1);

        parent.addEventListener("event", (ev)=>{
            called = true;
            ev.stopPropagationImmediate();
        }, true);

        child1.propagateEvent(new volksoper.Event("event"));

        expect(called).toBeTruthy();
        expect(child1.event).toBeFalsy();

    });
});