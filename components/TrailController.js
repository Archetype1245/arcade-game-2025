class TrailController extends Component {
    anchorOffset = Vector2.zero
    duration = 1.0
    maxPoints = 50
    minDistance = 2
    maxInterval = 0.05
    widthStart = 8
    widthEnd = 0
    alphaStart = 0.8
    alphaEnd = 0
    color = { r: 255, g: 255, b: 255, a: 1 }
    pauseWhenStationary = true
    stationaryThreshold = 0.5
    target = null

    _historyX = null
    _historyY = null
    _historyTime = null

    _px = null
    _py = null
    _w = null
    _a = null

    _head = 0
    _count = 0
    _lastSampleTime = 0
    _lastPosition = null
    _isRecording = true

    _polyPoints = []
    _polygon = null

    _gradientStart = Vector2.zero
    _gradientEnd = Vector2.zero
    _alphaStart = 0
    _alphaEnd = 0

    miterLimit = 1.5

    start() {
        // Typed Arrays (performance)
        this._historyX    = new Float32Array(this.maxPoints)
        this._historyY    = new Float32Array(this.maxPoints)
        this._historyTime = new Float32Array(this.maxPoints)

        this._px = new Float32Array(this.maxPoints)
        this._py = new Float32Array(this.maxPoints)
        this._w  = new Float32Array(this.maxPoints)
        this._a  = new Float32Array(this.maxPoints)

        // Would have to refactor Polygon (again) to handle flat arrays, so _polyPoints is just Array for now
        this._polyPoints = new Array(this.maxPoints * 2)
        for (let i = 0; i < this.maxPoints * 2; i++) {
            this._polyPoints[i] = Vector2.zero
        }

        this._polygon = this.gameObject.addComponent(new Polygon(), {
            hidden: true,
            fillStyle: (ctx) => this._createGradient(ctx)
        })

        if (this.target) {
            const worldPos = this._sampleWorld()
            this._lastPosition = worldPos
            this._lastSampleTime = Time.time
            this._addPoint(worldPos, Time.time)
        }
    }

    lateUpdate(dt) {
        if (!this.target) return

        const now = Time.time
        const p = this._sampleWorld()
        const dv = p.minus(this._lastPosition)
        const dist = dv.magnitude
        const dir = dist > 0 ? dv.times(1 / dist) : (this._lastDir ?? new Vector2(1, 0))

        if (this.pauseWhenStationary) {
            const speed = dist / Math.max(dt, MathUtils.EPS)
            this._isRecording = speed > this.stationaryThreshold
        } else {
            this._isRecording = true
        }

        const timeExceeded = now - this._lastSampleTime >= Math.min(this.maxInterval, dt * 0.5)
        const distExceeded = dist >= this.minDistance

        if (this._isRecording && (timeExceeded || distExceeded)) {
            this._addPoint(p, now)
            this._lastPosition = p
            this._lastSampleTime = now
            this._lastDir = dir
        }

        this._removeExpiredPoints(now)
        this._updatePolygon()
    }

    _updatePolygon() {
        const N = this._count
        if (N < 2) {
            this._polygon.hidden = true
            return
        }

        this._polygon.hidden = false
        const now = Time.time

        const px = this._px
        const py = this._py
        const w  = this._w
        const a  = this._a
        const hX = this._historyX
        const hY = this._historyY
        const hT = this._historyTime

        const head = this._head
        const max = this.maxPoints

        for (let i = 0; i < N; i++) {
            // Calculate ring buffer index
            let idx = (head - N + i) % max
            if (idx < 0) idx += max

            px[i] = hX[idx]
            py[i] = hY[idx]

            const age = (now - hT[idx]) / this.duration
            const t = Math.max(0, 1 - age)

            w[i] = this.widthStart * t + this.widthEnd * (1 - t)
            a[i] = (this.alphaStart * t + this.alphaEnd * (1 - t)) * this.color.a
        }

        for (let i = 0; i < N; i++) {
            let nx = 0, ny = 0, m = 1

            if (i === 0 || i === N - 1) {
                // Endpoints logic
                const j = (i === 0) ? 1 : i
                const dx = px[j] - px[j - 1]
                const dy = py[j] - py[j - 1]
                const len = Math.hypot(dx, dy) || 1
                nx = -dy / len
                ny = dx / len
            } else {
                // Miter logic
                const dx0 = px[i] - px[i - 1]
                const dy0 = py[i] - py[i - 1]
                const dx1 = px[i + 1] - px[i]
                const dy1 = py[i + 1] - py[i]

                const l0 = Math.hypot(dx0, dy0) || 1
                const l1 = Math.hypot(dx1, dy1) || 1

                const n0x = -dy0 / l0
                const n0y =  dx0 / l0
                const n1x = -dy1 / l1
                const n1y =  dx1 / l1

                nx = n0x + n1x
                ny = n0y + n1y

                let nLen = Math.hypot(nx, ny)
                if (nLen < MathUtils.EPS) {
                    nx = n1x
                    ny = n1y
                    nLen = 1
                } else {
                    nx /= nLen
                    ny /= nLen
                }

                const denom = nx * n1x + ny * n1y
                m = 1 / Math.max(denom, 1e-5)
                if (m > this.miterLimit) m = this.miterLimit
            }

            this._addLRToPoly(i, px[i], py[i], nx, ny, w[i], m, N)
        }

        this._polygon.points = this._polyPoints.slice(0, 2 * N)
        this._polygon.markDirty()

        this._gradientStart.setVec(px[0], py[0])
        this._gradientEnd.setVec(px[N - 1], py[N - 1])
        this._alphaStart = a[0]
        this._alphaEnd = a[N - 1]
    }

    _addPoint(position, time) {
        // Update the typed arrays directly
        this._historyX[this._head] = position.x
        this._historyY[this._head] = position.y
        this._historyTime[this._head] = time

        this._head = (this._head + 1) % this.maxPoints
        this._count = Math.min(this._count + 1, this.maxPoints)
    }

    _removeExpiredPoints(currentTime) {
        while (this._count > 0) {
            // Calculate oldest index in ring buffer
            let oldestIdx = (this._head - this._count) % this.maxPoints
            if (oldestIdx < 0) oldestIdx += this.maxPoints

            // Access time directly
            if (currentTime - this._historyTime[oldestIdx] > this.duration) {
                this._count--
            } else {
                break
            }
        }
    }

    _sampleWorld() {
        if (!this.target) return null
        const t = this.target.transform
        const base = t.worldPosition
        const c = Math.cos(t.rotation)
        const s = Math.sin(t.rotation)
        const sx = t.scale.x
        const sy = t.scale.y
        const ox = this.anchorOffset.x * sx
        const oy = this.anchorOffset.y * sy
        const rx = ox * c - oy * s;
        const ry = ox * s + oy * c;
        return new Vector2(base.x + rx, base.y + ry);
    }

    _addLRToPoly(i, px, py, nx, ny, wi, m, N) {
        const off = 0.5 * wi * m
        const ox = nx * off, oy = ny * off
        this._polyPoints[i].setVec(px + ox, py + oy)
        this._polyPoints[2 * N - 1 - i].setVec(px - ox, py - oy)
    }

    _createGradient(ctx) {
        const g = ctx.createLinearGradient(
            this._gradientStart.x, this._gradientStart.y,
            this._gradientEnd.x, this._gradientEnd.y
        )
        g.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${this._alphaStart})`)
        g.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},${this._alphaEnd})`)
        return g
    }
}