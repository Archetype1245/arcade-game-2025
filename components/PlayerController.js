class PlayerController extends Component {
    start() {
        this.cam = Camera2D.main.getComponent(Camera2D)
        this.speed = Config.speed.player
        this.framesSinceFired = Infinity
        this.fireRate = 5
        this.radius = 20
        this.bounds = {
            x1: Config.playable.x1 + this.radius,
            x2: Config.playable.x2 - this.radius,
            y1: Config.playable.y1 + this.radius,
            y2: Config.playable.y2 - this.radius,
        }
    }

    update() {
        this.movePlayer()
        if (Input.mouseIsDown) this.tryToFire()
        this.framesSinceFired++
    }

    movePlayer() {
        let dx = 0, dy = 0
        if (Input.keysDown.has("KeyW")) dy -= 1
        if (Input.keysDown.has("KeyS")) dy += 1
        if (Input.keysDown.has("KeyA")) dx -= 1
        if (Input.keysDown.has("KeyD")) dx += 1

        if (dx || dy) {
            const scale = (dx && dy) ? MathUtils.INV_SQRT2 : 1
            const amt = this.speed * Time.deltaTime * scale

            let { x, y } = this.transform.position
            x += dx * amt
            y += dy * amt

            // Ensure player stays within bounds. Only update transform once.
            const nx = MathUtils.clamp(x, this.bounds.x1, this.bounds.x2)
            const ny = MathUtils.clamp(y, this.bounds.y1, this.bounds.y2)
            this.transform.position = new Vector2(nx, ny)
        }
    }

    tryToFire() {
        if (this.framesSinceFired > this.fireRate) {
            const { x, y } = this.transform.position
            const mousePoint = { x: Input.mouseX, y: Input.mouseY }
            const wp = this.cam.screenPointToWorld(mousePoint)

            const angle = Math.atan2(wp.y - y, wp.x - x)
            const f = new Vector2(wp.x - x, wp.y - y).normalize()
            const orth = f.orthogonal()

            // Will almost certainly revisit this when dealing with power-ups that affect shooting
            const forwardOffset = 5
            const sideOffset = 10

            const leftBarrel = new Vector2(x + f.x * forwardOffset - orth.x * sideOffset,
                y + f.y * forwardOffset - orth.y * sideOffset
            )
            const rightBarrel = new Vector2(x + f.x * forwardOffset + orth.x * sideOffset,
                y + f.y * forwardOffset + orth.y * sideOffset
            )

            GameObject.instantiate(new LaserGameObject(angle), { position: leftBarrel, layer: Config.layers.effects })
            GameObject.instantiate(new LaserGameObject(angle), { position: rightBarrel, layer: Config.layers.effects })

            this.framesSinceFired = -1
        }
    }
}