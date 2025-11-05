class CardBodyGameObject extends GameObject {
    constructor(width, height) {
        super("CardBodyGameObject")
    
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
            fillStyle: "rgba(40, 170, 240, 1)",
            fill: true,
            // strokeStyle: "rgba(100, 180, 235, 0.7)",
            lineWidth: 2
        })
        
        const colors = {
            r: 40,
            g: 170,
            b: 240
        }

        this.addComponent(new CardVisualController(colors))
    }
}
