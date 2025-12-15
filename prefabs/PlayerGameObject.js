class PlayerGameObject extends GameObject {
    constructor() {
        super("PlayerGameObject")
        this.tag = "player"
        this.size = 10
        this.transform.setScale(this.size)
        this.transform.rotation = -Math.PI/2

        this.addComponent(new PlayerController())
        this.collider = this.addComponent(new PolygonCollider(), {
            points: Config.Shapes.ship.points
        })
        this.addComponent(new Polygon(), {
            points: Config.Shapes.ship.points,
            fillStyle: Config.Colors.player
        })

    }
}