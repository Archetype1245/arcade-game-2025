class GameScene extends Scene {
    constructor() {
        super({
            collisionPairs: [
                ["player", "enemy"],
                ["laser", "enemy"]
            ],
            trackedTags: ["enemy", "laser"],
            layerDefs: [
                { name:"background", space: "world" },
                { name:"grid",       space: "world" },
                { name:"trails",     space: "world" },
                { name:"effects",    space: "world" },
                { name:"enemies",    space: "world" },
                { name:"player",     space: "world" },
                { name:"ui",         space: "screen"},
                { name:"debug",      space: "world" }
            ]
        })

        const cx = Config.playable.w / 2
        const cy = Config.playable.h / 2
        const player = GameObject.instantiate(new PlayerGameObject(), {
            scene: this,
            position: new Vector2(cx, cy),
            layer: Config.layers.player
        })

        const trail = GameObject.instantiate(new GameObject("PlayerTrailGameObject"), { scene: this, layer: "effects" })
        trail.addComponent(new TrailController(), {
            ...TrailController.presets.player,
            target: player
        })

        const maxW = Config.playable.w * Config.camera.coverage
        const maxH = Config.playable.h * Config.camera.coverage
        const viewW = Math.min(maxW, maxH * Config.camera.aspect)
        const viewH = viewW / Config.camera.aspect

        const camOpts = {
            backgroundColor: Config.colors.gameBackground,
            aspect: Config.camera.aspect,
            viewWidth: viewW,
            viewHeight: viewH,
            zoom: Config.camera.zoom
        }
        const cam = GameObject.instantiate(new CameraGameObject(camOpts), { scene: this })
        cam.addComponent(new FollowTargetController(player))

        GameObject.instantiate(new PlayableAreaGameObject(), { scene: this })
        GameObject.instantiate(new DebugGameObject(), { scene: this, layer: Config.layers.debug })
        GameObject.instantiate(new SpawnManagerGameObject(), { scene: this })
        GameObject.instantiate(new UIDisplayGameObject(), { scene: this, layer: "ui" })

        this.activeCamera = cam.getComponent(Camera2D)

        GameGlobals.score = 100000
    }
}