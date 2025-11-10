class RingEventController extends Component {
    constructor(params) {
        super()

        this.spawner = params.manager
        this.center = params.center
        this.radius = params.radius
        this.enemy = EnemyDefs[params.enemyId]
        this.count = params.count
    }

    start() {
        this.spawnRing()
        this.gameObject.destroy()
    }

    spawnRing() {
        for (let i = 0; i < this.count; i++) {
            const angle = 2 * Math.PI * (i / this.count);

            const radiusVariation = (Math.random() - 0.5) * 30
            const actualRadius = this.radius + radiusVariation

            const position = {
                x: this.center.x + Math.cos(angle) * actualRadius,
                y: this.center.y + Math.sin(angle) * actualRadius
            }

            this.spawner.spawn(this.enemy, position)
        }
    }
}