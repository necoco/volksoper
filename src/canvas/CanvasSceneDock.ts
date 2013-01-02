module volksoper{
    export class CanvasSceneDock extends HTMLSceneDock{
        private _newImageImpl(src: string): SurfaceImpl{
            return new CanvasImageImpl(src, this.stage);
        }
    }
}