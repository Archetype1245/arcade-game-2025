class PurpleEnemyController extends Component {
    start() {
        this.transform.setUniformScale(24)
        this.speed = 200
        const a = Math.random()*2*Math.PI
        this.dir = (new Vector2(Math.cos(a), Math.sin(a))).normalize()
        this.rotationSpeed = -1.25

        this.gameObject.addComponent(new Collider())
        // Hidden square polygon used for collision detection (non-precise)
        this.gameObject.addComponent(new PolygonCollider(), {
            points: [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 1), new Vector2(1, -1)],
            fill: false,
            hidden: true
        })
        this.poly = this.gameObject.addComponent(new Polygon(), {
            points: [new Vector2(0, 0), new Vector2(0, -0.9), new Vector2(-1, -1), new Vector2(1, 1), new Vector2(0, 0.9),
                     new Vector2(0, 0), new Vector2(-0.9, 0), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(0.9, 0)],
            fillStyle: Config.colors.purpleFill,
            strokeStyle: Config.colors.purpleLine,
            lineWidth: 1
        })

    }

    update() {
        let t = this.transform.position


        this.transform.rotate(this.rotationSpeed * Math.PI * Time.deltaTime)
        
        this.poly.markDirty()
    }
}