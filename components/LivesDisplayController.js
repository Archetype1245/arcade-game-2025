class LivesDisplayController extends Component {
    constructor(textComponent, playerGO) {
        super()
        this.livesText = textComponent
        this.playerGO = playerGO
        this.playerController = null
    }

    start() {
        if (this.playerGO) {
            this.playerController = this.playerGO.getComponent(PlayerController)
        }
        if (!this.playerController) {
            const p = GameObject.getObjectByName?.("PlayerGameObject")
            if (p) this.playerController = p.getComponent(PlayerController)
        }
    }

    update() {
        // Update text from player lives
        if (this.playerController) {
            this.livesText.text = `LIVES: ${this.playerController._lives}`
        }

        const scene = SceneManager.currentScene
        const cam = scene?.activeCamera
        if (!cam) return

        const vp = cam.getViewportRect()  // { x, y, width, height }
        const marginX = 100
        const marginY = 50

        // Parented to UIRoot, which repositions to (vp.x, vp.y) each frame, so offset here is simple
        const x = (vp.width / UIScale.scale) - marginX
        const y = marginY

        this.transform.position = new Vector2(x, y)
    }
}
