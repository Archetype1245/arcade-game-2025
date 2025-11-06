class MainMenuScene extends Scene {
    constructor() {
        super({
            collisionPairs: [],
            trackedTags: []
        })
        this.layerOrder = ["background", "grid", "carouselBack", "projectorBeam", "carouselMid", "carouselFront", "ui"]
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

        const bgGrid = GameObject.instantiate(new GridBackgroundGameObject({
                horizonRatio: 0.4,    // 0 = top, 1 = bottom
                camY: 16,
                gridSpacing: 3,
                zNear: 1,
                zFar: 80,
                scrollSpeed: -1.5,
            }), { scene: this, layer: "grid" }
        );
    }
}
