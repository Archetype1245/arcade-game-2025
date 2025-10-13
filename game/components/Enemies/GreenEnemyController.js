class GreenEnemyController extends Component {
    start() {
        this.transform.setUniformScale(10)
        this.gameObject.addComponent(new Collider())
        this.player = GameObject.getObjectByName("PlayerGameObject")
        this.rotationSpeed = 0.5
        this.speed = 350

        this.outer = {
            tL: new Vector2(-3, -3),
            bL: new Vector2(-3, 3),
            bR: new Vector2(3, 3),
            tR: new Vector2(3, -3)
        }

        this.inner = {
            tL: new Vector2(-2, -2),
            bL: new Vector2(-2, 2),
            bR: new Vector2(2, 2),
            tR: new Vector2(2, -2),
            tM: new Vector2(-0.1, -0.5),
            bM: new Vector2(0.1, 0.5)
        }
        // Defined these to have a default base for the midpoints that never gets modified
        this.midOffsets = {
            tM: new Vector2(-0.1, -0.5),
            bM: new Vector2(0.1, 0.5)
        }

        // Hidden (rough) outline poly to handle collision checks
        this.gameObject.addComponent(new PolygonCollider(), {
            points: [this.outer.tL, this.outer.bL, this.outer.bR, this.outer.tR],
            hidden: true
        })

        this.outerTris = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.outer.tL, this.inner.tL, this.inner.bL],
                [this.outer.bL, this.inner.bL, this.inner.bR],
                [this.outer.bR, this.inner.bR, this.inner.tR],
                [this.outer.tR, this.inner.tR, this.inner.tL]
            ],
            fillStyle: Config.colors.greenBase,
            strokeStyle: Config.colors.greenUpperLines,
            lineWidth: 2
        })
        this.upperLeftLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.tL, this.inner.tM, this.inner.tR],
                [this.inner.bL, this.inner.tM, this.inner.tL],
            ],
            fillStyle: Config.colors.greenHi,
            strokeStyle: Config.colors.greenUpperLines,
            lineWidth: 2
        })
        this.upperRightLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.bL, this.inner.tM, this.inner.bR],
                [this.inner.bR, this.inner.tM, this.inner.tR],
            ],
            fillStyle: Config.colors.greenLow,
            strokeStyle: Config.colors.greenUpperLines,
            lineWidth: 2
        })

        this.lowerLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.inner.tL, this.inner.bM],
                [this.inner.bL, this.inner.bM],
                [this.inner.bR, this.inner.bM],
                [this.inner.tR, this.inner.bM],
            ],
            fill: false,
            strokeStyle: Config.colors.greenBottomLines,
            lineWidth: 2
        })

        this.polys = [this.outerTris, this.upperLeftLines, this.upperRightLines, this.lowerLines]
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

        // let t = this.transform.position
        // const p = this.player.transform.position
        // const dir = p.getDirectionVector(t)

        // const newPos = t.plusEquals(dir.times(this.speed * Time.deltaTime))
        // this.transform.position = newPos

        this.polys.forEach(p => p.markDirty())
    }
}