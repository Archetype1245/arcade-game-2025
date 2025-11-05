class CardHeaderGameObject extends GameObject {
    constructor(width, height) {
        super("CardHeaderGameObject")

        const halfWidth = width / 2
        const halfHeight = height / 2
        const rectanglePoints = [
            new Vector2(-halfWidth, -halfHeight),
            new Vector2(-halfWidth, halfHeight), 
            new Vector2(halfWidth, halfHeight),  
            new Vector2(halfWidth, -halfHeight)  
        ]

        this.addComponent(new Polygon(), {
            points: rectanglePoints,
            fillStyle: "rgba(60, 140, 200, 1)",
            fill: true,
            // strokeStyle: "rgba(120, 200, 255, 0.9)",
            lineWidth: 2
        })

        const colors = {
            r: 35,
            g: 57,
            b: 140
        }

        this.addComponent(new CardVisualController(colors))
    }
}
