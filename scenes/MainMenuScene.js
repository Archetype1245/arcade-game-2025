class MainMenuScene extends Scene {
    constructor() {
        super({
            collisionPairs: [],
            trackedTags: ["bgDot"],
            layerDefs: [
                { name: "background",    space: "world" },
                { name: "grid",          space: "screen" },
                { name: "dots",          space: "screen" },
                { name: "carouselBack",  space: "world" },
                { name: "projectorBeam", space: "world" },
                { name: "carouselMid",   space: "world" },
                { name: "carouselFront", space: "world" },
                { name: "ui",            space: "screen" }
            ]
        })

        const viewW = 1600
        const viewH = viewW / Config.Camera.aspect
        const camOpts = {
            backgroundColor: Config.Colors.menuBackground,
            aspect: Config.Camera.aspect,
            viewWidth: viewW,
            viewHeight: viewH,
            zoom: Config.Camera.zoom
        }

        const cam = GameObject.instantiate(new CameraGameObject(camOpts), { scene: this })
        this.activeCamera = cam.getComponent(Camera2D)

        const uiRoot = GameObject.instantiate(new GameObject("UIRootGameObject"), { scene: this, layer: "ui" })
        uiRoot.addComponent(new UIRootController())

        const designWidth = UIScale.refWidth
        const designHeight = designWidth / Config.Camera.aspect

        const gridBackground = GameObject.instantiate(new GridBackgroundGameObject({
            horizonRatio: 0.4,
            fakeCamY: 16,
            zNear: 1,
            zFar: 80,
            scrollSpeed: -1.5,
            designWidth: designWidth,
            designHeight: designHeight
        }), { scene: this, layer: "grid" })
        gridBackground.transform.setParent(uiRoot.transform, false)

        const dotNetwork = GameObject.instantiate(new GameObject("DotNetworkGameObject"), { scene: this, layer: "dots" })
        dotNetwork.transform.setParent(uiRoot.transform, false)
        dotNetwork.addComponent(new DotNetworkController(), {
            designWidth: designWidth,
            designHeight: designHeight
        })

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
    }
}
