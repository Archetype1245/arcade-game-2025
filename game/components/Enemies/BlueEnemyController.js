class BlueEnemyController extends Component {
    start() {
        this.transform.setUniformScale(10)
        this.gameObject.addComponent(new Collider())
        this.player = GameObject.getObjectByName("PlayerGameObject")
        this.speed = 350
        this.amp = 0.18
        this.period = 2.5
        this.t0 = Time.time

        this.defs = {
            top: new Vector2(0.5, -4),
            bot: new Vector2(0.5, 3.5),
            fL: new Vector2(-2, 0),
            fR: new Vector2(2, 0),
            bL: new Vector2(-0.5, -1),
            bR: new Vector2(3.5, -1)
        }

        this.c = MathUtils.getCentroid([this.defs.fL, this.defs.fR, this.defs.bL, this.defs.bR])
        // Grab the basis vectors for the object - enables working in truly local dimensions
        this.u = this.defs.top.minus(this.defs.bot).normalize()
        this.v = this.u.orthogonal()

        this.base = {}
        for (const [k, p] of Object.entries(this.defs)) {
            const diff = p.minus(this.c)
            // For each difference vector, map it onto the local/basis axes for easy scaling later
            this.base[k] = { a: diff.dot(this.u), b: diff.dot(this.v) }
        }

        // Build polygons/paths
        // Hidden poly for collisions
        this.gameObject.addComponent(new PolygonCollider(), {
            points: [this.defs.top, this.defs.fL, this.defs.bot, this.defs.bR],
            hidden: true
        })
        // Top half
        this.topFrontPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.fL, this.defs.fR],
            strokeStyle: Config.colors.lightblueLinesFront,
            fillStyle: Config.colors.lightblueHi,
            lineWidth: 2
        })
        this.topLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.fL, this.defs.bL],
            strokeStyle: Config.colors.lightblueLinesBack,
            fillStyle: Config.colors.lightblueT,
            lineWidth: 2
        })
        this.topBackPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.bL, this.defs.bR],
            strokeStyle: Config.colors.lightblueLinesBack,
            fillStyle: Config.colors.lightblueT,
            lineWidth: 2
        })
        this.topRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.fR, this.defs.bR],
            strokeStyle: Config.colors.lightblueLinesFront,
            fillStyle: Config.colors.lightblueM,
            lineWidth: 2
        })
        // Bottom half
        this.bottomFrontPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.fL, this.defs.fR],
            strokeStyle: Config.colors.lightblueLinesFront,
            fillStyle: Config.colors.lightblueM,
            lineWidth: 2
        })
        this.bottomLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.fL, this.defs.bL],
            strokeStyle: Config.colors.lightblueLinesBack,
            fillStyle: Config.colors.lightblueT,
            lineWidth: 2
        })
        this.bottomBackPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.bL, this.defs.bR],
            strokeStyle: Config.colors.lightblueLinesBack,
            fillStyle: Config.colors.lightblueT,
            lineWidth: 2
        })
        this.bottomRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.fR, this.defs.bR],
            strokeStyle: Config.colors.lightblueLinesFront,
            fillStyle: Config.colors.lightblueLow,
            lineWidth: 2
        })

        this.polys = [this.topFrontPoly, this.topLeftPoly, this.topRightPoly, this.topBackPoly,
        this.bottomFrontPoly, this.bottomLeftPoly, this.bottomRightPoly, this.bottomBackPoly]
    }

    update() {
        // Sinusoidal function to cycle between +- amplitude. Subtracting t0 to make an individual GO's cycle start on spawn and not be global
        const s = this.amp * Math.sin((2 * Math.PI / this.period) * (Time.time - this.t0))
        const su = 1 + s
        const sv = 1 / su

        for (const k in this.base) {
            const { a, b } = this.base[k]
            // Scale the dot products we calculated earlier by the u/v scale factors - this scales our total magnitude for the u/v axes.
            // Then use these values to scale the u/v basis vectors - this gives the scaled u/v component vectors
            // Finally, adding these component vectors to the centroid gives the properly scaled position of the point
            const p = this.c.plus(this.u.times(a * su)).plus(this.v.times(b * sv))
            this.defs[k].setVec(p.x, p.y)         // Mutating the values directly, so the Polygon components see the updates immediately
        }

        // let t = this.transform.position
        // const p = this.player.transform.position
        // const dir = p.getDirectionVector(t)

        // const newPos = t.plusEquals(dir.times(this.speed * Time.deltaTime))
        // this.transform.position = newPos

        this.polys.forEach(p => p.markDirty())
    }
}