class PlayerGameObject extends GameObject {
    constructor() {
        super("PlayerGameObject")
        this.addComponent(new PlayerController())
        this.addComponent(new Collider())
        this.addComponent(new PolygonCollider(), { fillStyle: Config.colors.player, points: [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(1, 1), new Vector2(-1, 1)] })
        this.transform.scale = new Vector2(20, 20)
    }
}