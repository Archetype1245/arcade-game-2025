class RingEventController extends Component {
    constructor(params) {
        super()

        this.spawner = params.manager
        // this.center = params.center
        this.radius = params.radius
        this.enemy = EnemyDefs[params.enemyId]
        this.count = params.count
        this.center = GameObject.getObjectByName("PlayerGameObject").transform.position
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

            let x = this.center.x + Math.cos(angle) * actualRadius
            let y = this.center.y + Math.sin(angle) * actualRadius
            const spawnPos = this.spawner.ensureValidSpawnPosition(x, y)
            
            this.spawner.spawn(this.enemy, spawnPos)
        }
    }
}