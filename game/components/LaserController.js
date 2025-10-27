class LaserController extends Component {
    constructor(a) {
        super()
        this.angle = a
    }
    start() {
        this.speed = Config.speed.bullets
        this.velocity = Vector2.zero
        this.sizeTip = 20
        this.sizeBase = 8
        this.transform.scale = new Vector2(this.sizeTip, this.sizeBase)
        this.transform.rotation = this.angle

        this.cos = Math.cos(this.transform.rotation)
        this.sin = Math.sin(this.transform.rotation)

        this.bounds = {
            x1: Config.playable.x1 + this.sizeTip / 2,
            x2: Config.playable.x2 - this.sizeTip / 2,
            y1: Config.playable.y1 + this.sizeTip / 2,
            y2: Config.playable.y2 - this.sizeTip / 2,
        }

        this.def = {
            tL: new Vector2(-1, -1),
            bL: new Vector2(-1, 1),
            tip: new Vector2(1, 0)
        }

        this.poly = this.gameObject.addComponent(new Polygon(), {
            points: [this.def.tL, this.def.bL, this.def.tip],
            fillStyle: "#e8ca75ff",
        })
    }

    update() {
        this.gameObject.swept.capturePrev()
        this.velocity.setVec(this.speed * Time.deltaTime * this.cos, this.speed * Time.deltaTime * this.sin)
        this.transform.translate(this.velocity.x, this.velocity.y)
        // this.col.markDirty()

        if (this.transform.position.x < this.bounds.x1 || this.transform.position.x > this.bounds.x2 ||
            this.transform.position.y < this.bounds.y1 || this.transform.position.y > this.bounds.y2) {
            this.gameObject.destroy()
        }
    }

    onCollisionEnter(other) {
        if (other instanceof EnemyGameObject) {
            this.gameObject.destroy()
            other.destroy()
        }
    }
}
