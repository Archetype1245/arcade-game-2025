class CornerEventController extends Component {
    constructor(params) {
        super()

        this.spawner = params.manager
        this.corners = params.corners
        this.enemy = EnemyDefs[params.enemyId]
        this.perCorner = params.perCorner
        this.duration = params.duration

        this.totalToSpawn = this.corners.length * this.perCorner
        this.spawnInterval = this.duration / this.totalToSpawn

        this.timeSinceLastSpawn = 0
        this.spawnsDone = 0
    }

    start() {
    }

    update(dt) {
        if (this.spawnsDone >= this.totalToSpawn) {
            this.gameObject.destroy()
            return
        }

        this.timeSinceLastSpawn += dt

        while (this.timeSinceLastSpawn >= this.spawnInterval && this.spawnsDone < this.totalToSpawn) {
            this.spawnNextEnemy()
            this.timeSinceLastSpawn -= this.spawnInterval
        }
    }

    spawnNextEnemy() {
        const cornerIndex = this.spawnsDone % this.corners.length
        const corner = this.corners[cornerIndex]

        const position = {
            x: corner.x + (Math.random() - 0.5) * 20,
            y: corner.y + (Math.random() - 0.5) * 20
        }

        this.spawner.spawn(this.enemy, position)
        this.spawnsDone++
    }
}