class CardBodyGameObject extends GameObject {
    constructor(width, height, config = {}) {
        super("CardBodyGameObject")

        this.iconPoly = null

        const hw = width / 2
        const hh = height / 2
        const rectPoints = [
            new Vector2(-hw, -hh),
            new Vector2(-hw, hh),
            new Vector2(hw, hh),
            new Vector2(hw, -hh)
        ]

        this.addComponent(new Polygon(), {
            points: rectPoints,
            fillStyle: "rgba(40, 170, 240, 1)",
            fill: true,
            // strokeStyle: "rgba(100, 180, 235, 0.7)",
            lineWidth: 2
        })

        const color = { r: 40, g: 170, b: 240 }
        this.addComponent(new CardVisualController(color))

        if (config.iconType && Config.Shapes[config.iconType]) {
            this._setupIcon(config.iconType)
        }
    }

    _setupIcon(type) {
        const shapeDef = Config.Shapes[type]

        const iconGO = GameObject.instantiate(new GameObject("BodyIcon_" + type), {
            scene: SceneManager.currentScene,
            layer: "carouselMid"
        })

        iconGO.transform.setParent(this.transform)
        iconGO.transform.localPosition = Vector2.zero
        iconGO.transform.scale = new Vector2(30.0, 30.0) // Uniform scale for all icons

        iconGO.transform.rotation = shapeDef.rotation || 0

        this.iconPoly = iconGO.addComponent(new Polygon(), {
            points: shapeDef.points,
            fillStyle: "rgba(200, 240, 255, 1)",
            strokeStyle: "rgba(100, 200, 255, 0.9)",
            lineWidth: 1
        })
    }
}
