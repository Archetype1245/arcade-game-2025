class PinkEnemyController extends Component {
    start() {
        this.cellData = SceneManager.getActiveScene().cellData
        this.player = GameObject.getObjectByName("PlayerGameObject")

        this.size = 38
        this.radius = this.size
        this.transform.setScale(this.size)

        this.speed = Config.speed.pinkEnemy
        this.period = 1.5

        this.defs = {
            left: new Vector2(-1, 0), right: new Vector2(1, 0),
            top: new Vector2(0, -1), bot: new Vector2(0, 1),
            tM: new Vector2(-0.05, -0.125),
            bM: new Vector2(0.05, 0.125)
        }

        // Build polygons/paths/collision
        this.gameObject.collider.points = [this.defs.left, this.defs.bot, this.defs.right, this.defs.top]

        this.topLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.left, this.defs.tM],
            fillStyle: Config.colors.pinkHi,
        })

        // this.topRightPoly = this.gameObject.addComponent(new Polygon(), {
        //     points: [this.defs.top, this.defs.tM, this.defs.right],
        //     fillStyle: Config.colors.pinkBase,
        //     lineWidth: 1
        // })
        // this.bottomLeftPoly = this.gameObject.addComponent(new Polygon(), {
        //     points: [this.defs.bot, this.defs.tM, this.defs.left],
        //     fillStyle: Config.colors.pinkBase,
        //     lineWidth: 1
        // })

        this.midShadePolys = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.top, this.defs.tM, this.defs.right],
                [this.defs.bot, this.defs.tM, this.defs.left]
            ],
            fillStyle: Config.colors.pinkBase,
        })

        this.bottomRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.right, this.defs.tM],
            fillStyle: Config.colors.pinkLow,
        })
        this.lowerLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.left, this.defs.bM, this.defs.right],
                [this.defs.bot, this.defs.bM, this.defs.top]
            ],
            strokeStyle: Config.colors.pinkBottomLines,
            closePath: false,
            fill:false,
            lineWidth: 1
        })
        this.upperLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.left, this.defs.top, this.defs.right, this.defs.bot],
                [this.defs.bot, this.defs.tM, this.defs.top],
                [this.defs.left, this.defs.tM, this.defs.right]
            ],
            strokeStyle: Config.colors.pinkUpperLines,
            closePath: false,
            fill: false,
            lineWidth: 1
        })

        this.polys = [this.gameObject.collider, this.lowerLines, this.upperLines, this.midShadePolys,
                      this.topLeftPoly, /*this.topRightPoly, this.bottomLeftPoly*/, this.bottomRightPoly]
    }

    update() {
        const p = this.player.transform.position
        let t = this.transform.position

        const dir = p.getDirectionVector(t)
        const r = Math.atan2(dir.y, dir.x)                                                    // Angle to make the enemy "face" the player

        const wobble = (Math.PI / 6) * (Math.sin((2 * Math.PI / this.period) * Time.time))    // Oscillation between +- 30 degrees
        this.transform.setRotation(r + wobble)                                                // Enemy turns to "face" the player but always has the oscillation

        t.plusEquals(dir.times(this.speed * Time.deltaTime))
        // Stay in bounds
        if (t.x < Config.playable.x1 + this.radius) t.x = this.radius
        if (t.x > Config.playable.x2 - this.radius) t.x = Config.playable.x2 - this.radius
        if (t.y < Config.playable.y1 + this.radius) t.y = this.radius
        if (t.y > Config.playable.y2 - this.radius) t.y = Config.playable.y2 - this.radius
        this.transform.position = t

        this.polys.forEach(p => p.markDirty())
    }

    onDestroy() {
        this.cellData.remove(this)
    }

}