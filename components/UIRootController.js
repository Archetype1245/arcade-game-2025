class UIRootController extends Component {
    constructor() {
        super()
        this._oldScale = null
    }

    start() {
        this.cam = SceneManager.currentScene.activeCamera
        this.setPosition()
        this.setScale()
    }

    update() {
        this.setPosition()
        this.setScale()
    }
               
    setPosition() {
        if (!this.cam) return

        const vp = this.cam.getViewportRect()
        this.transform.position = new Vector2(vp.x, vp.y)
    }

    setScale() {
        const scale = UIScale.scale

        if (scale !== this._oldScale) {
            this.transform.scale = new Vector2(scale, scale)
            this._oldScale = scale
        }
    }
}
