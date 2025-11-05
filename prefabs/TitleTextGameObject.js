class TitleTextGameObject extends GameObject {
    constructor() {
        super("TitleTextGameObject")
        this.addComponent(new Text(), {
            text: "POLYGON ASSAULT",
            font: "bold 72px Arial, sans-serif",
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
    }
}
