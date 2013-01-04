
///<reference path="../core/SceneDock.ts/"/>

module volksoper{
    export class HTMLSceneDock extends SceneDock{
        constructor(stage: Stage, private _parentDock?: HTMLSceneDock){
            super(stage, _parentDock);
        }


        private _newImageImpl(src: string): SurfaceImpl{
            return new HTMLImageImpl(src);
        }

        private _newSoundImpl(src: string, autoPlay: bool): SoundImpl{
            return <SoundImpl>new (Platform.instance().getSoundImplClass())(src, autoPlay);
        }




    }
}