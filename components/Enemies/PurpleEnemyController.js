class PurpleEnemyController extends Component {
    start() {
        this.size = 24
        this.radius = Math.hypot(this.size, this.size)
        this.transform.setScale(this.size)

        this.speed = Config.speed.purpleEnemy
        this.rotationSpeed = -1.25
        const a = Math.random() * 2 * Math.PI
        this.dir = (new Vector2(Math.cos(a), Math.sin(a))).normalize()   // Assign a random direction to move

        this.defs = {
            tL: new Vector2(-1, -1), tM: new Vector2(0, -0.9), tR: new Vector2(1, -1),
            mL: new Vector2(-0.9, 0), mM: new Vector2(0, 0), mR: new Vector2(0.9, 0),
            bL: new Vector2(-1, 1), bM: new Vector2(0, 0.9), bR: new Vector2(1, 1),
        }

        // Build polygons/paths/collision
        this.gameObject.collider.points = [this.defs.tL, this.defs.bL, this.defs.bR, this.defs.tR]

        this.poly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.mM, this.defs.tM, this.defs.tL, this.defs.bR, this.defs.bM,
            this.defs.mM, this.defs.mL, this.defs.bL, this.defs.tR, this.defs.mR],
            fillStyle: Config.colors.purpleFill,
            strokeStyle: Config.colors.purpleLine,
            lineWidth: 1
        })
        this.polys = [this.gameObject.collider, this.poly]
    }

    update() {
        // Rotates at a constant speed
        this.transform.rotate(this.rotationSpeed * Math.PI * Time.deltaTime)

        // Moves in whatever random direction was decided on spawn
        let t = this.transform.position
        t.plusEquals(this.dir.times(this.speed * Time.deltaTime))
        // Bounce off the edges of the arena and stay in bounds
        if (t.x < Config.playable.x1 + this.radius) { t.x = Config.playable.x1 + this.radius; this.dir.x *= -1 }
        if (t.x > Config.playable.x2 - this.radius) { t.x = Config.playable.x2 - this.radius; this.dir.x *= -1 }
        if (t.y < Config.playable.y1 + this.radius) { t.y = Config.playable.y1 + this.radius; this.dir.y *= -1 }
        if (t.y > Config.playable.y2 - this.radius) { t.y = Config.playable.y2 - this.radius; this.dir.y *= -1 }

        this.transform.position = t

        this.polys.forEach(p => p.markDirty())
    }
}