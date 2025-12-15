class GreenEnemyController extends Component {
    start() {
        this.player = GameObject.getObjectByName("PlayerGameObject")

        this.size = 30
        this.radius = Math.hypot(this.size, this.size)
        this.transform.setScale(this.size)

        this.rotationSpeed = 0.5
        this.speed = EnemyDefs.GreenEnemy.speed

        this.outer = {
            tL: new Vector2(-1, -1), tR: new Vector2(1, -1),
            bL: new Vector2(-1, 1), bR: new Vector2(1, 1),
        }

        this.inner = {
            tM: new Vector2(-0.04, -0.14),
            tL: new Vector2(-0.6, -0.6), tR: new Vector2(0.6, -0.6),
            bL: new Vector2(-0.6, 0.6), bR: new Vector2(0.6, 0.6),
            bM: new Vector2(0.04, 0.14)
        }
        // Defined these to have a default base for the midpoints that never gets modified
        this.midOffsets = {
            tM: new Vector2(-0.04, -0.14),
            bM: new Vector2(0.04, 0.14)
        }

        // Set shape bounds for proper boundary clamping
        this.shapeBounds = {
            top: this.outer.tL.y * this.size,
            bot: this.outer.bL.y * this.size,
            left: this.outer.tL.x * this.size,
            right: this.outer.tR.x * this.size
        }

        // Build polygons/paths/collision
        this.gameObject.collider.points = [this.outer.tL, this.outer.bL, this.outer.bR, this.outer.tR]

        this.outerTris = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.outer.tL, this.inner.tL, this.inner.bL],
                [this.outer.bL, this.inner.bL, this.inner.bR],
                [this.outer.bR, this.inner.bR, this.inner.tR],
                [this.outer.tR, this.inner.tR, this.inner.tL]
            ],
            fillStyle: Config.Colors.greenBase
        })
        this.upperLeft = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.tL, this.inner.tM, this.inner.tR],
                [this.inner.bL, this.inner.tM, this.inner.tL],
            ],
            fillStyle: Config.Colors.greenHi
        })
        this.upperRight = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.bL, this.inner.tM, this.inner.bR],
                [this.inner.bR, this.inner.tM, this.inner.tR],
            ],
            fillStyle: Config.Colors.greenLow
        })
        this.upperLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.outer.tL, this.inner.bL, this.outer.bL, this.inner.bR,
                this.outer.bR, this.inner.tR, this.outer.tR, this.inner.tL,
                this.inner.bL, this.inner.bR, this.inner.tR, this.inner.tL],
                [this.inner.tL, this.inner.tM, this.inner.bR],
                [this.inner.bL, this.inner.tM, this.inner.tR]
            ],
            strokeStyle: Config.Colors.greenUpperLines,
            fill: false,
            closePath: false,
            lineWidth: 1
        })
        this.lowerLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.tL, this.inner.bM, this.inner.bR],
                [this.inner.bL, this.inner.bM, this.inner.tR]
            ],
            strokeStyle: Config.Colors.greenBottomLines,
            fill: false,
            closePath: false,
            lineWidth: 1
        })

        this.gameObject.addComponent(new SeparationController(), {
            radius: this.size * 0.5,
            maxPush: this.size * 0.5,
        })

        this.polys = [this.gameObject.collider, this.outerTris, this.upperLeft, this.upperRight, this.upperLines, this.lowerLines]
    }

    update() {
        // Apply a static rotation to the polygon points
        this.transform.rotate(this.rotationSpeed * Math.PI * Time.deltaTime)

        // I want the object to appear to rotate around the middle axis, but the object is faux-3D,
        // so the "midpoints" are just offset from the actual local origin.
        // When rotating, I want to keep these two points stationary (with respect to the rotation),
        // so I rotate the whole gameObject, and then counter-rotate the two points.
        const r = this.transform.rotation
        const invRotMatrix = Mat2D.rotate(-r)
        const unrotatedTM = Mat2D.applyRSToPoint(invRotMatrix, this.midOffsets.tM)
        const unrotatedBM = Mat2D.applyRSToPoint(invRotMatrix, this.midOffsets.bM)
        this.inner.tM.setVec(unrotatedTM.x, unrotatedTM.y)
        this.inner.bM.setVec(unrotatedBM.x, unrotatedBM.y)

        this.polys.forEach(p => p.markDirty())
    }
}