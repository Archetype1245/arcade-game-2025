class EnemyDeathFXController extends Component {
    start() {
        Events.addEventListener("EnemyKilled", this)
        Events.addEventListener("EnemyDestroyed", this)

        this.fx = GameObject.getObjectByName("ParticleFX").getComponent(ParticleFXController)
    }

    handleEvent(signal, event) {
        if (!this.fx) return
        if (signal !== "EnemyKilled" && signal !== "EnemyDestroyed") return

        const x = event.pos.x
        const y = event.pos.y

        const enemyKey = event.enemyDef.key
        const preset = ParticlePresets.EnemyExplosions[enemyKey]

        this.fx.burst(x, y, preset)
    }
}
