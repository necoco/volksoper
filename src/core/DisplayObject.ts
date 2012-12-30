
///<reference path="Actor.ts"/>


module volksoper{
    export class DisplayObject extends volksoper.Actor{
        alpha: number = 1;

        x: number = 0;
        y: number = 0;
        z: number = 0;

        pivotX: number;
        pivotY: number;

        width: number = 0;
        height: number = 0;

        rotation: number = 0;
        rotationX: number = 0;
        rotationY: number = 0;

        scaleX: number = 1;
        scaleY: number = 1;

        visible: bool = true;
    }
}