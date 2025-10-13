class LaserGameObject extends GameObject {
    constructor(a) {
        super("LaserGameObject")
        this.addComponent(new LaserController(a))
        this.addComponent(new Collider())
        this.addComponent(new PolygonCollider(), {
            points: [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 0)],
            fillStyle: "#e8ca75ff",
        })
    }
}