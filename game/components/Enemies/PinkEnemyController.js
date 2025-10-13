class PinkEnemyController extends Component {
    start() {
        this.transform.setUniformScale(20)
        this.gameObject.addComponent(new Collider())
        this.player = GameObject.getObjectByName("PlayerGameObject")
        this.period = 1.5

        this.defs = {
            left: new Vector2(-2, 0),
            right: new Vector2(2, 0),
            top: new Vector2(0, -2),
            bot: new Vector2(0, 2),
            tM: new Vector2(-0.1, -0.25),
            bM: new Vector2(0.1, 0.25)
        }

        // Hidden full poly to handle collision checks
        this.gameObject.addComponent(new PolygonCollider(), {
            points: [this.defs.left, this.defs.bot, this.defs.right, this.defs.top],
            hidden: true
        })

        this.topLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.left, this.defs.tM],
            fillStyle: Config.colors.pinkHi,
            strokeStyle: Config.colors.pinkUpperLines,
            lineWidth: 1
        })

        this.topRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.tM, this.defs.right],
            fillStyle: Config.colors.pinkBase,
            strokeStyle: Config.colors.pinkUpperLines,
            lineWidth: 1
        })

        this.bottomLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.tM, this.defs.left],
            fillStyle: Config.colors.pinkBase,
            strokeStyle: Config.colors.pinkUpperLines,
            lineWidth: 1
        })
        this.bottomRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.right, this.defs.tM],
            fillStyle: Config.colors.pinkLow,
            strokeStyle: Config.colors.pinkUpperLines,
            lineWidth: 1
        })
        this.lowerLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.left, this.defs.bM],
                [this.defs.bot, this.defs.bM],
                [this.defs.right, this.defs.bM],
                [this.defs.top, this.defs.bM],
            ],
            fillStyle: Config.colors.pinkLow,
            strokeStyle: Config.colors.pinkBottomLines,
            lineWidth: 1
        })

        this.polys = [this.topLeftPoly, this.topRightPoly, this.bottomLeftPoly, this.bottomRightPoly]
    }

    update() {
        const p = this.player.transform.position
        const t = this.transform.position

        const dx = t.x - p.x
        const dy = t.y - p.y

        const dir = t.getDirectionVector(p)
        // const dir = (new Vector2(t.x - p.x, t.y - p.y)).normalize()
        const r = Math.atan2(dir.y, dir.x)                             // Angle to make the enemy "face" the player
        
        const wobble = (Math.PI / 6) * (Math.sin((2 * Math.PI / this.period) * Time.time))        // Oscillation between +- 30 degrees
        this.transform.setRotation(r + wobble)                                                // Enemy turns to "face" the player but always has the oscillation

        this.polys.forEach(p => p.markDirty())
    }

}