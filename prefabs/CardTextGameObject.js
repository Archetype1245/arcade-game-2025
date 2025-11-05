class CardTextGameObject extends GameObject {
    constructor(text) {
        super("CardTextGameObject")
        this.menuText = text

        this.addComponent(new Text(), {
            text: text,
            fillStyle: "rgba(220, 240, 255, 1.0)",
            font: "bold 18px Arial, sans-serif",
            textAlign: "center",
            textBaseline: "middle",
            glow: true,
            glowConfig: {
                color: "rgba(100, 200, 255, 1.0)",
                blur: 8,
                offsetX: 0,
                offsetY: 0,
                alpha: 1
            }
        })
    }
}
