class MainMenuScene extends Scene {
    constructor() {
        super({
            collisionPairs: [],
            trackedTags: ["bgDot"]
        })
        this.layerOrder = ["background", "grid", "dots", "carouselBack", "projectorBeam", "carouselMid", "carouselFront", "ui"]
        this.initLayers()

        const viewW = 1600
        const viewH = viewW / Config.camera.aspect
        const camOpts = {
            backgroundColor: Config.colors.menuBackground,
            aspect: Config.camera.aspect,
            viewWidth: viewW,
            viewHeight: viewH,
            zoom: Config.camera.zoom
        }

        const cam = GameObject.instantiate(new CameraGameObject(camOpts), { scene: this })
        this.activeCamera = cam.getComponent(Camera2D)

        GameObject.instantiate(new ProjectorBeamGameObject(), {
            scene: this,
            position: new Vector2(0, 350),
            layer: "projectorBeam"
        })

        GameObject.instantiate(new TitleTextGameObject(), {
            scene: this,
            position: new Vector2(0, -315),
            layer: "projectorBeam"
        })

        GameObject.instantiate(new CarouselGameObject(), {
            scene: this,
            layer: "background"
        })

        GameObject.instantiate(new GridBackgroundGameObject({
                horizonRatio: 0.4,
                fakeCamY: 16,
                zNear: 1,
                zFar: 80,
                scrollSpeed: -1.5,
            }), {
                scene: this,
                layer: "grid" 
                }
        )

        const dotNetwork = new GameObject("DotNetworkGameObject")
        dotNetwork.addComponent(new DotNetworkController())
        GameObject.instantiate(dotNetwork, {
            scene: this,
            layer: "dots"
        })
    }
}
