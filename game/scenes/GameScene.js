class GameScene extends Scene {
    constructor() {
        super()
        this.layerOrder = Object.values(Config.layers)
        this.initLayers()

        const cx = Config.playable.w / 2
        const cy = Config.playable.h / 2

        const player = GameObject.instantiate(new PlayerGameObject(), { scene: this, position: new Vector2(cx, cy), layer: Config.layers.player })
        const cam = GameObject.instantiate(new CameraGameObject(), { scene: this })
        GameObject.instantiate(new PlayableAreaGameObject(), { scene: this })
        GameObject.instantiate(new DebugGameObject(), { scene: this, layer: Config.layers.debug })

        this.activeCamera = cam.getComponent(Camera2D)
        this.enemies = new Map()
        this.cellData = new CellMap()

        this._sinBlue = (2*Math.PI/2.5) * Time.deltaTime
    }
}