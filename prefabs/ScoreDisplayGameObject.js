class ScoreDisplayGameObject extends GameObject {
    constructor() {
        super("ScoreDisplayGameObject")

        this.scoreText = this.addComponent(new Text(), {
            text: `SCORE: ${GameGlobals.score}`,
            font: "bold 36px Arial, sans-serif",
            textAlign: "left",
            textBaseline: "top",
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

        this.addComponent(new ScoreDisplayController(this.scoreText))
    }
}