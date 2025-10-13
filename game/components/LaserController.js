class LaserController extends Component {
    constructor(a) {
        super()
        this.angle = a
    }
    start() {
        this.speed = 1400
        this.size = 20
        this.transform.scale = new Vector2(this.size, 8)
        this.transform.rotation = this.angle
        this.cos = Math.cos(this.transform.rotation)
        this.sin = Math.sin(this.transform.rotation)
        this.bounds = {
            x1: Config.playable.x1 + this.size / 2,
            x2: Config.playable.x2 - this.size / 2,
            y1: Config.playable.y1 + this.size / 2,
            y2: Config.playable.y2 - this.size / 2,
        }
    }

    update() {
        let dx = this.speed * Time.deltaTime * this.cos
        let dy = this.speed * Time.deltaTime * this.sin

        this.transform.translate(dx, dy)

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