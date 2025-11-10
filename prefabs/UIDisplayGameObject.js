class UIDisplayGameObject extends GameObject {
    constructor() {
        super("UIDisplayGameObject")
        this.addComponent(new Text(), {
            text: `SCORE: ${GameGlobals.score}`,
            font: "bold 24px Arial, sans-serif",
            fillStyle: "rgba(200, 240, 255, 1)",
            glow: true,
            glowConfig: {
                color: "rgba(100, 200, 255, 0.8)",
                blur: 20
            },
            outline: true,
            outlineConfig: {
                color: "rgba(100, 200, 255, 0.8)"
            }
        })

        this.addComponent(new UIDisplayController())

        this.transform.position = new Vector2(100, 50)
    }
}