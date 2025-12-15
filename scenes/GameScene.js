class GameScene extends Scene {
    constructor() {
        super({
            collisionPairs: [
                ["player", "enemy"],
                ["laser", "enemy"]
            ],
            trackedTags: ["enemy", "laser", "player"],
            layerDefs: [
                { name: "background",   space: "world",  time: "background"},
                { name: "grid",         space: "world",  time: "background"},
                { name: "trails",       space: "world",  time: "world"},
                { name: "effects",      space: "world",  time: "fx"},
                { name: "enemies",      space: "world",  time: "world"},
                { name: "player",       space: "world",  time: "world"},
                { name: "high effects", space: "world",  time: "fx"},
                { name: "ui",           space: "screen", time: "ui"},
                { name: "manager",      space: "world",  time: "unscaled"},
                { name: "debug",        space: "world",  time: "world"}
            ]
        })
        
        const manager = GameObject.instantiate(new GameObject("GameManagerGameObject"), {
            scene: this,
            layer: "manager"
        })
        manager.addComponent(new GameFlowController())
        manager.addComponent(new PauseHotkeyController())

        const cx = Config.Playable.w / 2
        const cy = Config.Playable.h / 2
        const player = GameObject.instantiate(new PlayerGameObject(), {
            scene: this,
            position: new Vector2(cx, cy),
            layer: "player"
        })

        GameObject.instantiate(new DistortionGridGameObject({
            cellSize: 100,

            influenceRadius: 200,
            influenceSearchRadius: 1300,  // 13 cells
            objectWeight: 30000,
            springK: 10.0,
            damping: 0.02,
            maxDisplacement: 15,
            softeningRadius: 50,

            drawLines: true,
            drawCells: true,
            lineBaseColor: [0, 220, 255],
            lineBaseAlpha: 0.1,
            lineGlowAlpha: 0.3,

            influenceTags: ["player", "enemy"],
            tagWeights: {
                player: 300.0,
                enemy: 90.0
            },

            colorConfig: {
                compressionHue: 170,
                expansionHue: 280,
                saturation: 80,
                minLightness: 8,
                maxLightness: 40,
                minAlpha: 0.02,
                maxAlpha: 0.4
            }
        }), { scene: this, layer: "grid" })

        const trail = GameObject.instantiate(new GameObject("PlayerTrailGameObject"), { scene: this, layer: "effects" })
        trail.addComponent(new TrailController(), {
            ...Config.TrailPresets.player,
            target: player
        })

        const maxW = Config.Playable.w * Config.Camera.coverage
        const maxH = Config.Playable.h * Config.Camera.coverage
        const viewW = Math.min(maxW, maxH * Config.Camera.aspect)
        const viewH = viewW / Config.Camera.aspect

        const camOpts = {
            backgroundColor: Config.Colors.gameBackground,
            aspect: Config.Camera.aspect,
            viewWidth: viewW,
            viewHeight: viewH,
            zoom: Config.Camera.zoom
        }
        const cam = GameObject.instantiate(new CameraGameObject(camOpts), { scene: this })
        cam.addComponent(new FollowTargetController(player))
        this.activeCamera = cam.getComponent(Camera2D)

        const fxGO = new GameObject("ParticleFX")
        const fx = fxGO.addComponent(new ParticleFXController())
        fxGO.addComponent(new EnemyDeathFXController())
        GameObject.instantiate(fxGO, {
            scene: this,
            layer: "effects"
        })

        GameObject.instantiate(new PlayableAreaGameObject(), { scene: this })
        GameObject.instantiate(new DebugGameObject(), { scene: this, layer: "debug" })
        GameObject.instantiate(new SpawnManagerGameObject(), { scene: this })

        const uiRoot = GameObject.instantiate(new GameObject("UIRootGameObject"), { scene: this, layer: "ui" })
        uiRoot.addComponent(new UIRootController())

        const hud = GameObject.instantiate(new GameHUDGameObject(this, player), { scene: this, layer: "ui" })
        hud.transform.setParent(uiRoot.transform)        

        GameGlobals.score = 0
    }
}