class LaserController extends Component {
    constructor(a) {
        super()
        this.angle = a
    }
    start() {
        this.speed = Config.Lasers.speed
        this.velocity = Vector2.zero
        this.sizeTip = 20
        this.sizeBase = 8
        this.transform.scale = new Vector2(this.sizeTip, this.sizeBase)
        this.transform.rotation = this.angle

        this.cos = Math.cos(this.transform.rotation)
        this.sin = Math.sin(this.transform.rotation)

        this.bounds = {
            x1: Config.Playable.x1 + this.sizeTip / 2,
            x2: Config.Playable.x2 - this.sizeTip / 2,
            y1: Config.Playable.y1 + this.sizeTip / 2,
            y2: Config.Playable.y2 - this.sizeTip / 2,
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

        // Spawn once, behind the laser
        if (!this.gameObject.trailGO) {
            const trailGO = new GameObject("LaserTrailGameObject")
            this.gameObject.trailGO = trailGO;

            trailGO.addComponent(new TrailController(), {
                ...Config.TrailPresets.laser,
                target: this.gameObject
            });

            GameObject.instantiate(trailGO, {
                layer: "trails"
            })
        }
    }

    update() {
        this.gameObject.swept.capturePrev()
        this.velocity.setVec(this.speed * Time.deltaTime * this.cos, this.speed * Time.deltaTime * this.sin)
        this.transform.translate(this.velocity.x, this.velocity.y)

        if (this.transform.position.x < this.bounds.x1 || this.transform.position.x > this.bounds.x2 ||
            this.transform.position.y < this.bounds.y1 || this.transform.position.y > this.bounds.y2) {

            this.gameObject.destroy()
            if (this.gameObject.trailGO) {
                this.gameObject.trailGO.destroy()
            }
        }
    }

    onCollisionEnter(other) {
        if (other instanceof BaseEnemyGameObject) {
            Events.fireEvent("EnemyKilled", {
                enemyDef: other.enemyDef,
                pos: other.transform.position,
                shotAngle: this.angle
            })

            this.gameObject.destroy()
            if (this.gameObject.trailGO) this.gameObject.trailGO.destroy()
            other.destroy()
        }
    }
}
