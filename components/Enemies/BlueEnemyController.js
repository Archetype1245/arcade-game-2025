class BlueEnemyController extends Component {
    start() {
        this.player = GameObject.getObjectByName("PlayerGameObject")
        this.deform = this.gameObject.addComponent(new Deform())

        this.size = 40
        this.transform.setScale(this.size)

        this.speed = Config.speed.blueEnemy
        this.dir = Vector2.one
        this.amp = 0.18
        this.period = 2.5
        this.theta = 2*Math.PI/this.period
        this.t0 = Time.time

        this.defs = {
            top: new Vector2(0.125, -1), bot: new Vector2(0.125, 0.875),
            fL: new Vector2(-0.5, 0), fR: new Vector2(0.5, 0),
            bL: new Vector2(-0.125, -0.25), bR: new Vector2(0.875, -0.25)
        }

        this.c = MathUtils.getCentroid([this.defs.fL, this.defs.fR, this.defs.bL, this.defs.bR])
        // Grab the basis vectors for the object - enables working in truly local dimensions
        this.u = this.defs.top.minus(this.defs.bot).normalize()
        this.v = this.u.orthogonal()
        this.deform.setBasisAndCenter(this.u, this.v, this.c)

        this.base = {}
        for (const [k, p] of Object.entries(this.defs)) {
            const diff = p.minus(this.c)
            // For each difference vector, map it onto the local/basis axes for easy scaling later
            this.base[k] = { a: diff.dot(this.u), b: diff.dot(this.v) }
        }

        // Build polygons/paths/collision
        this.gameObject.collider.points = [this.defs.top, this.defs.fL, this.defs.bot, this.defs.bR]

        // Top half
        this.topFrontPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.fL, this.defs.fR],
            fillStyle: Config.colors.lightblueHi,
        })
        // this.topRightPoly = this.gameObject.addComponent(new Polygon(), {
        //     points: [this.defs.top, this.defs.fR, this.defs.bR],
        //     fillStyle: Config.colors.lightblueM,
        //     lineWidth: 2
        // })

        // this.bottomFrontPoly = this.gameObject.addComponent(new Polygon(), {
        //     points: [this.defs.bot, this.defs.fL, this.defs.fR],
        //     fillStyle: Config.colors.lightblueM,
        //     lineWidth: 2
        // })

        // Combined the above two, for now, since they're the same shade
        this.midShadePolys = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.top, this.defs.fR, this.defs.bR],
                [this.defs.bot, this.defs.fL, this.defs.fR]
            ],
            fillStyle: Config.colors.lightblueM,
        })
        this.bottomRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.fR, this.defs.bR],
            fillStyle: Config.colors.lightblueLow,
        })
        // Merged all lines/strokes into two polys to minimize stroke calls
        this.backLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.top, this.defs.bL, this.defs.bot],
                [this.defs.fL, this.defs.bL, this.defs.bR]
            ],
            strokeStyle: Config.colors.lightblueLinesBack,
            closePath: false,
            fill: false,
            lineWidth: 1
        })
        this.frontLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.top, this.defs.fL, this.defs.bot, this.defs.bR, this.defs.top, this.defs.fR, this.defs.bot],
                [this.defs.fL, this.defs.fR, this.defs.bR]
            ],
            strokeStyle: Config.colors.lightblueLinesFront,
            closePath: false,
            fill: false,
            lineWidth: 1
        })

        this.polys = [this.gameObject.collider, this.topFrontPoly, /*this.topRightPoly, this.bottomFrontPoly,*/
                      this.midShadePolys, this.bottomRightPoly, this.frontLines, this.backLines]

        // Define shape bounds for generic clamping
        this.shapeBounds = {
            top: this.defs.top.y * this.size,
            bot: this.defs.bot.y * this.size,
            left: this.defs.fL.x * this.size,
            right: this.defs.bR.x * this.size
        }
    }

    update() {
        // Sinusoidal function to cycle between +- amplitude. Subtracting t0 to make an individual GO's cycle start on spawn and not be global
        const s = this.amp * Math.sin(this.theta * (Time.time - this.t0))
        const su = 1 + s
        const sv = 1 / su
        this.deform.setScaleUV(su, sv)
        
        this.polys.forEach(p => p.markDirty())
    }
}