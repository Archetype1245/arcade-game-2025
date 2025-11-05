class GameScene extends Scene {
    constructor() {
        super()
        this.layerOrder = Object.values(Config.layers)
        this.initLayers()

        const cx = Config.playable.w / 2
        const cy = Config.playable.h / 2
        const player = GameObject.instantiate(new PlayerGameObject(), { scene: this, position: new Vector2(cx, cy), layer: Config.layers.player })
        
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
        
        this.activeCamera = cam.getComponent(Camera2D)
        this.enemies = new Map()
        this.cellData = new CellMap()
    }
}