class SpawnController extends Component {
    constructor() {
        super()

        // Initial values currently tuned for testing various things - TODO: adjust for normal gameplay when done
        this.intensity = 7

        this.timeSinceEnemySpawn = IntensityConfig.spawnIntervalMax
        this.timeSinceEventCheck = 8

        this.eventCooldowns = {}
        for (const eventId in EventDefs) {
            this.eventCooldowns[eventId] = 0
        }
    }

    start() {
        this.player = GameObject.getObjectByName("PlayerGameObject")
        this.screenDiag = Math.hypot(Engine.canvas.width / 2, Engine.canvas.height / 2)

        // Listen for enemy deaths to handle pink enemy splits
        Events.addEventListener("EnemyDeath", (data) => {
            if (data.enemyDef.type === Config.enemyTypes.pink) {
                this.handlePinkEnemySplit(data)
            }
        })
    }

    update(dt) {
        this.updateIntensity(dt);

        this.timeSinceEnemySpawn += dt
        this.timeSinceEventCheck += dt

        const currentSpawnInterval = this.getCurrentSpawnInterval()

        for (const eventId in this.eventCooldowns) {
            if (this.eventCooldowns[eventId] > 0) {
                this.eventCooldowns[eventId] = Math.max(0, this.eventCooldowns[eventId] - dt)
            }
        }

        if (this.timeSinceEventCheck >= IntensityConfig.eventCheckInterval) {
            // const event = EventDefs.blue_corner_rain
            const event = EventDefs.blue_ring_burst
            EventScriptRunner.runScript(event.scriptId, this, event)

            this.timeSinceEventCheck = 0
        }

        if (this.timeSinceEnemySpawn >= currentSpawnInterval) {
            this.spawnEnemies()
            this.timeSinceEnemySpawn = 0
        }
    }

    updateIntensity(dt) {
        const currentScore = GameGlobals.score || 0

        const baseGain = IntensityConfig.baseGainPerSecond * dt
        const scoreGain = currentScore > 0 ? Math.pow(Math.log10(currentScore), 2) * dt : 0

        this.intensity += Math.max(baseGain, scoreGain)
        this.intensity = Math.min(this.intensity, IntensityConfig.maxIntensity)
    }

    getCurrentSpawnInterval() {
        const t = Math.min(1, this.intensity / IntensityConfig.spawnIntervalScaleIntensity)
        return IntensityConfig.spawnIntervalMax -
            (IntensityConfig.spawnIntervalMax - IntensityConfig.spawnIntervalMin) * t
    }

    getSpawnsPerTick() {
        const t = Math.min(1, this.intensity / 100)
        const range = IntensityConfig.maxSpawnsPerTick - IntensityConfig.minSpawnsPerTick
        return Math.floor(IntensityConfig.minSpawnsPerTick + range * t)
    }

    async spawn(enemy, pos) {
        if (enemy.beamColor) {
            await LightBeam.triggerBeam(pos, {
                color: enemy.beamColor,
                length: this.screenDiag
            })
        }

        // Create the appropriate enemy prefab based on type
        let enemyGameObject
        switch (enemy.type) {
            case Config.enemyTypes.purple:
                enemyGameObject = new PurpleEnemyGameObject(enemy)
                break
            case Config.enemyTypes.blue:
                enemyGameObject = new BlueEnemyGameObject(enemy)
                break
            case Config.enemyTypes.green:
                enemyGameObject = new GreenEnemyGameObject(enemy)
                break
            case Config.enemyTypes.pink:
                enemyGameObject = new PinkEnemyGameObject(enemy)
                break
            case Config.enemyTypes.small:
                enemyGameObject = new SmallEnemyGameObject(enemy)
                break
            default:
                console.warn("Unknown enemy type:", enemy.type)
                return
        }

        GameObject.instantiate(enemyGameObject, {
            scene: SceneManager.currentScene,
            layer: Config.layers.enemies,
            position: pos
        })
    }

    spawnEnemies() {
        let budget = this.intensity
        const currentScore = GameGlobals.score || 0

        const eligibleEnemies = []
        for (const enemyId in EnemyDefs) {
            const enemy = EnemyDefs[enemyId]
            if (enemy.cost <= budget &&
                this.intensity >= enemy.minIntensity &&
                currentScore >= enemy.minScore) {
                eligibleEnemies.push(enemy)
            }
        }

        if (eligibleEnemies.length === 0) return

        const maxSpawnsThisTick = this.getSpawnsPerTick()

        let spawnsThisTick = 0
        while (spawnsThisTick < maxSpawnsThisTick && budget > 0) {
            const affordableEnemies = eligibleEnemies.filter(e => e.cost <= budget)
            if (affordableEnemies.length === 0) {
                break
            }

            const enemy = this.selectWeighted(affordableEnemies)
            if (!enemy) {
                break
            }

            budget -= enemy.cost
            const position = this.generateSpawnPosition()
            this.spawn(enemy, position)

            spawnsThisTick++
        }

        this.intensity = budget
    }

    checkAndSpawnEvent() {
        if (this.intensity < IntensityConfig.minIntensityForEvents) {
            return
        }

        const currentScore = GameGlobals.score || 0

        const eligibleEvents = []
        for (const eventId in EventDefs) {
            const event = EventDefs[eventId]
            if (this.intensity >= event.cost && this.intensity >= event.minIntensity &&
                currentScore >= event.minScore && this.eventCooldowns[eventId] === 0) {

                eligibleEvents.push(event)
            }
        }

        if (eligibleEvents.length === 0) {
            return
        }

        const event = this.selectWeighted(eligibleEvents)
        if (!event) {
            return
        }

        this.intensity -= event.cost
        this.eventCooldowns[event.id] = event.cooldown
        EventScriptRunner.runScript(event.scriptId, this, event)
    }

    selectWeighted(items) {
        if (items.length === 0) {
            return null
        }

        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
        if (totalWeight <= 0) {
            return null
        }

        let random = Math.random() * totalWeight;
        for (const item of items) {
            random -= item.weight
            if (random <= 0) {
                return item
            }
        }

        return items[items.length - 1]
    }

    handlePinkEnemySplit(deathData) {
        const { pos, shotAngle } = deathData

        for (let i = 0; i < 3; i++) {
            // Random angle within (+-)π/2 of laser angle helps ensure player safety on enemy spawn
            const angleOffset = (Math.random() - 0.5) * Math.PI
            const spawnAngle = shotAngle + angleOffset

            const distance = 150 + Math.random() * 150   // 150-300

            const x = pos.x + Math.cos(spawnAngle) * distance
            const y = pos.y + Math.sin(spawnAngle) * distance
            const spawnPos = this.ensureValidSpawnPosition(x, y)

            this.spawn(EnemyDefs.SmallEnemy, spawnPos)

            // GameObject.instantiate(new SmallEnemyGameObject(EnemyDefs.SmallEnemy), {
            //     scene: SceneManager.currentScene,
            //     layer: Config.layers.enemies,
            //     position: spawnPos
            // })
        }
    }

    generateSpawnPosition() {
        const pp = this.player.transform.position

        const minRadius = 150
        const maxRadius = this.screenDiag
        const angle = Math.random() * Math.PI * 2
        const distance = minRadius + Math.random() * (maxRadius - minRadius)

        let x = pp.x + Math.cos(angle) * distance
        let y = pp.y + Math.sin(angle) * distance
        const spawnPos = this.ensureValidSpawnPosition(x, y)

        return spawnPos
    }

    ensureValidSpawnPosition(x, y) {
        const b = Config.playable
        const inset = 25

        x = Math.min(Math.max(x, b.x1 + inset), b.x2 - inset)
        y = Math.min(Math.max(y, b.y1 + inset), b.y2 - inset)

        return new Vector2(x, y)
    }
}