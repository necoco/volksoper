module volksoper{
    export class CanvasSceneDock extends HTMLSceneDock{
        private _newImageImpl(src: string): SurfaceImpl{
            return new CanvasImageImpl(src, this.stage);
        }

        _createSurfaceImpl(width: number, height: number, renderer:any, primitive: bool, name: string): SurfaceImpl{
            return new CanvasSurfaceImpl(width, height, renderer, primitive, name, <CanvasStage>this.stage);
        }
    }
}