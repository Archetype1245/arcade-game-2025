class PlayerGameObject extends GameObject {
    constructor() {
        super("PlayerGameObject")
        this.tag = "player"
        this.size = 20
        this.transform.setScale(this.size)

        this.addComponent(new PlayerController())
        this.collider = this.addComponent(new PolygonCollider(), {
            points: [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(1, 1), new Vector2(-1, 1)]
        })
        this.addComponent(new Polygon(), {
            points: [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(1, 1), new Vector2(-1, 1)],
            fillStyle: Config.colors.player
        })
    }
}