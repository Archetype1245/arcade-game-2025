class MainMenuScene extends Scene {
    constructor() {
        super({
            collisionPairs: [],
            trackedTags: ["bgDot"],
            layerDefs: [
                { name:"background",    space: "world" },
                { name:"grid",          space: "screen"},
                { name:"dots",          space: "screen"},
                { name:"carouselBack",  space: "world" },
                { name:"projectorBeam", space: "world" },
                { name:"carouselMid",   space: "world" },
                { name:"carouselFront", space: "world" },
                { name:"ui",            space: "screen"}
            ]
        })

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
