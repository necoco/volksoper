module volksoper{
    export class CanvasSceneDock extends HTMLSceneDock{
        private _newImageImpl(src: string): SurfaceImpl{
            return new CanvasImageImpl(src, this.stage);
        }

        private _newSurfaceImpl(width: number, height: number,
                                renderer:any, primitive: bool, name: string): SurfaceImpl{
            return new CanvasSurfaceImpl(width, height, renderer, primitive, name, <CanvasStage>this.stage);
        }

        private _newLabelImpl(width: number, height: number, name: string): LabelImpl{
            return new CanvasLabelImpl(width, height, name, (<CanvasStage>this.stage).context);
        }
    }
}