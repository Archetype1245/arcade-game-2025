class PlayerController extends Component {
    start() {
        this.cam = Camera2D.main.getComponent(Camera2D)
        this.speed = Config.Player.speed

        this.radius = 25
        this.bounds = {
            x1: Config.Playable.x1 + this.radius,
            x2: Config.Playable.x2 - this.radius,
            y1: Config.Playable.y1 + this.radius,
            y2: Config.Playable.y2 - this.radius,
        }

        this.turnSpeed = 15
        this._targetRotation = -Math.PI / 2

        this.firePattern = Config.PlayerFirePatterns.base
        this.shotTimer = Infinity

        this.upgraded = false
        this.scoreThreshold = 5000      // score needed to obtain first upgrade
        this.upgradePeriod = 15         // seconds per upgrade duration
        this.upgradeTimer = 0           // seconds since last upgrade

        this._lives = 1
    }

    update(dt) {
        SceneManager.currentScene.gameObjects
        this.movePlayer()
        this._updateUpgrades(dt)

        if (Input.mouseIsDown) this._tryToFire()
        this.shotTimer += dt
    }

    movePlayer() {
        let dx = 0
        let dy = 0
        if (Input.keysDown.has("KeyW")) dy -= 1
        if (Input.keysDown.has("KeyS")) dy += 1
        if (Input.keysDown.has("KeyA")) dx -= 1
        if (Input.keysDown.has("KeyD")) dx += 1

        if (dx || dy) {
            const scale = (dx && dy) ? MathUtils.INV_SQRT2 : 1
            const amt = this.speed * Time.deltaTime * scale

            let p = this.transform.position
            p.x += dx * amt
            p.y += dy * amt

            const nx = MathUtils.clamp(p.x, this.bounds.x1, this.bounds.x2)
            const ny = MathUtils.clamp(p.y, this.bounds.y1, this.bounds.y2)
            this.transform.position = new Vector2(nx, ny)

            this._targetRotation = Math.atan2(dy, dx)
        }

        const t = 1 - Math.exp(-this.turnSpeed * Time.deltaTime)
        this.transform.rotation = MathUtils.lerpAngle(this.transform.rotation, this._targetRotation, t)
    }

    _tryToFire() {
        if (this.shotTimer < this.firePattern.cooldown) return

        const p = this.transform.position

        // Aim direction from player to mouse
        const mousePoint = { x: Input.mouseX, y: Input.mouseY }
        const wp = this.cam.screenPointToWorld(mousePoint)

        const angle = Math.atan2(wp.y - p.y, wp.x - p.x)
        const forward = new Vector2(Math.cos(angle), Math.sin(angle))
        const orth = forward.orthogonal() // normal for lateral barrel offsets

        const forwardOffset = this.radius + 20   // radius + half laser length

        for (const barrel of this.firePattern.barrels) {
            const side = barrel.sideOffset

            const spawnPos = new Vector2(
                p.x + forward.x * forwardOffset + orth.x * side,
                p.y + forward.y * forwardOffset + orth.y * side
            )

            const shotAngle = angle + barrel.angleDeg * Math.PI / 180

            GameObject.instantiate(new LaserGameObject(shotAngle), {
                position: spawnPos,
                layer: "effects"
            })
        }

        this.shotTimer = 0
    }

    _updateUpgrades(dt) {
        // First upgrade unlocks at 10,000 score
        if (!this.upgradedOnce && GameGlobals.score >= this.scoreThreshold) {
            this.upgradedOnce = true
            this.firePattern = Math.random() < 0.5 ? Config.PlayerFirePatterns.triple : Config.PlayerFirePatterns.quint
            this.upgradeTimer = 0
            return
        }

        // After first upgrade, alternate A <-> B every 30 seconds
        if (this.upgradedOnce) {
            this.upgradeTimer += dt
            if (this.upgradeTimer >= this.upgradePeriod) {
                this.upgradeTimer -= this.upgradePeriod
                this.firePattern = Config.PlayerFirePatterns.triple
                    ? Config.PlayerFirePatterns.quint
                    : Config.PlayerFirePatterns.triple
            }
        }
    }

    _nukeAllEnemies(killer) {
        const scene = SceneManager.currentScene
        const enemies = scene.collidersByTag.get("enemy")
        if (!enemies || enemies.size === 0) return

        const enemiesList = Array.from(enemies)

        for (const enemy of enemiesList) {
            if (!enemy || enemy.markForDelete || enemy === killer) continue

            Events.fireEvent("EnemyDestroyed", {
                enemyDef: enemy.enemyDef,
                pos: enemy.transform.position
            })

            enemy.destroy()
        }
    }

    _nukeAllLasers() {
        const scene = SceneManager.currentScene
        const lasers = scene.collidersByTag.get("laser")
        if (!lasers || lasers.size === 0) return

        for (const laser of Array.from(lasers)) {
            if (!laser || laser.markForDelete) continue

            if (laser.trailGO) laser.trailGO.destroy()
            laser.destroy()
        }
    }

    onCollisionEnter(other) {
        // return
        if (!(other instanceof BaseEnemyGameObject)) return
        this._lives -= 1

        const shield = GameObject.instantiate(new GameObject("PlayerShieldGameObject"), {
            scene: SceneManager.currentScene,
            layer: "high effects",
            position: this.transform.position
        })
        shield.transform.setParent(this.transform)

        shield.addComponent(new ShieldController(), {
            duration: 3.0,
            pulseStart: 2.0,
            radius: this.radius * 2,
            color: { r: 208, g: 91, b: 228, a: 1 }

        })
        this._nukeAllEnemies(other)
        this._nukeAllLasers()

        if (this._lives <= 0) {
            Events.fireEvent("GameOver")
        } else {
            Events.fireEvent("PlayerDeath", {
                enemy: other,
                shieldTimer: Config.Player.deathFreeze
            })
        }
    }
}
