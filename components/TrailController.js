class TrailController extends Component {
    duration = 1.0                                // How long trail segments persist (seconds)
    maxPoints = 50                                // Maximum number of trail points
    minDistance = 2                               // Minimum distance to record new point
    maxInterval = 0.05                            // Force sample if time exceeds this (seconds)
    widthStart = 8                                // Trail width at newest point
    widthEnd = 0                                  // Trail width at oldest point (taper)
    alphaStart = 0.8                              // Alpha at newest point
    alphaEnd = 0                                  // Alpha at oldest point (fade)
    color = { r: 255, g: 255, b: 255, a: 1 }      // Trail color
    pauseWhenStationary = true                    // Stop recording when nearly still
    stationaryThreshold = 0.5                     // Speed threshold for stationary detection
    target = null                                 // GameObject to track

    _points = []                                  // Circular buffer of {pos, time}
    _head = 0                                     // Current write position in circular buffer
    _count = 0                                    // Number of valid points
    _lastSampleTime = 0
    _lastPosition = null
    _isRecording = true

    _polygon = null
    _polyPoints = []                              // Reusable array for polygon vertices
    _gradientStart = Vector2.zero
    _gradientEnd = Vector2.zero
    _alphaStart = 0
    _alphaEnd = 0

    static MITER_LIMIT = 4

    start() {
        // Create circular buffer
        this._points = new Array(this.maxPoints)
        for (let i = 0; i < this.maxPoints; i++) {
            this._points[i] = { pos: Vector2.zero, time: 0 }
        }

        // Create polygon points array (left + right sides)
        this._polyPoints = new Array(this.maxPoints * 2)
        for (let i = 0; i < this.maxPoints * 2; i++) {
            this._polyPoints[i] = Vector2.zero
        }

        // Create initial arrays for reuse
        this._px = new Array(this.maxPoints)
        this._py = new Array(this.maxPoints)
        this._w  = new Array(this.maxPoints)
        this._a  = new Array(this.maxPoints)

        this._polygon = this.gameObject.addComponent(new Polygon(), {
            hidden: true,
            fillStyle: (ctx) => this._createGradient(ctx)
        })

        // Initialize with current position (if target exists)
        if (this.target) {
            const worldPos = this.target.transform.worldPosition
            this._lastPosition = worldPos
            this._lastSampleTime = Time.time
            this._addPoint(worldPos, Time.time)
        }
    }

    update(dt) {
        if (!this.target) return

        const now = Time.time
        const p = this.target.transform.worldPosition
        const dv = p.minus(this._lastPosition)
        const dist = dv.magnitude
        const dir = dist > 0 ? dv.times(1 / dist) : (this._lastDir ?? new Vector2(1, 0))

        if (this.pauseWhenStationary) {
            const speed = dist / Math.max(dt, 1e-6)
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
        const idx = (k) => MathUtils.mod(this._head - N + k, this.maxPoints)

        // Reuse the existing arrays each update
        const px = this._px
        const py = this._py
        const w  = this._w
        const a  = this._a

        for (let i = 0; i < N; i++) {
            const p = this._points[idx(i)]
            px[i] = p.pos.x
            py[i] = p.pos.y

            const age = (now - p.time) / this.duration
            const t = Math.max(0, 1 - age)
            w[i] = this.widthStart * t + this.widthEnd * (1 - t)
            a[i] = (this.alphaStart * t + this.alphaEnd * (1 - t)) * this.color.a
        }

        for (let i = 0; i < N; i++) {
            let nx = 0
            let ny = 0
            let m = 1
            if (i === 0 || i === N - 1) {
                const j = (i === 0) ? 1 : i
                const dx = px[j] - px[j - 1]
                const dy = py[j] - py[j - 1]
                const len = Math.hypot(dx, dy) || 1
                nx = -dy / len
                ny = dx / len
                m = 1
            } else {
                const dx0 = px[i] - px[i - 1]
                const dy0 = py[i] - py[i - 1]
                const dx1 = px[i + 1] - px[i]
                const dy1 = py[i + 1] - py[i]
                const l0 = Math.hypot(dx0, dy0) || 1
                const l1 = Math.hypot(dx1, dy1) || 1

                const n0x = -dy0 / l0
                const n0y = dx0 / l0
                const n1x = -dy1 / l1
                const n1y = dx1 / l1

                nx = n0x + n1x
                ny = n0y + n1y
                let nLen = Math.hypot(nx, ny)

                if (nLen < MathUtils.EPS) {
                    // 180° flip - fall back to next normal
                    nx = n1x
                    ny = n1y
                    nLen = 1
                } else {
                    nx /= nLen
                    ny /= nLen
                }

                const denom = nx * n1x + ny * n1y
                m = 1 / Math.max(denom, MathUtils.EPS)
                if (m > TrailController.MITER_LIMIT) m = TrailController.MITER_LIMIT
            }
            this._addLRToPoly(i, px[i], py[i], nx, ny, w[i], m, N)
        }

        // Set polygon points (slice to actual used length)
        this._polygon.points = this._polyPoints.slice(0, 2 * N)
        this._polygon.markDirty()

        // Store gradient parameters for the fillStyle function
        this._gradientStart.x = px[0]
        this._gradientStart.y = py[0]
        this._gradientEnd.x = px[N - 1]
        this._gradientEnd.y = py[N - 1]
        this._alphaStart = a[0]
        this._alphaEnd = a[N - 1]
    }

    _addLRToPoly(i, px, py, nx, ny, wi, m, N) {
        const off = 0.5 * wi * m
        const ox = nx * off, oy = ny * off
        this._polyPoints[i].setVec(px + ox, py + oy)                // left side forward
        this._polyPoints[2 * N - 1 - i].setVec(px - ox, py - oy)    // right side backward
    }

    _createGradient(ctx) {
        const g = ctx.createLinearGradient(
            this._gradientStart.x,
            this._gradientStart.y,
            this._gradientEnd.x,
            this._gradientEnd.y
        )
        g.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${this._alphaStart})`)
        g.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},${this._alphaEnd})`)
        return g
    }

    _addPoint(position, time) {
        const point = this._points[this._head]
        point.pos.setVec(position.x, position.y)
        point.time = time
        this._head = (this._head + 1) % this.maxPoints
        this._count = Math.min(this._count + 1, this.maxPoints)
    }

    _removeExpiredPoints(currentTime) {
        while (this._count > 0) {
            const oldestIdx = (this._head - this._count + this.maxPoints) % this.maxPoints
            const oldestPoint = this._points[oldestIdx]

            if (currentTime - oldestPoint.time > this.duration) {
                this._count--
            } else {
                break
            }
        }
    }

    clear() {
        this._count = 0
        this._head = 0
        if (this._polygon) {
            this._polygon.hidden = true
        }
    }

    resume() {
        this._isRecording = true
        if (this.target) {
            this._lastPosition = this.target.transform.worldPosition
            this._lastSampleTime = Time.time
        }
    }

    // Presets
    static presets = {
        player: {
            duration: 0.5,
            maxPoints: 100,
            minDistance: 0.4,
            maxInterval: 0.01,
            widthStart: 40,
            widthEnd: 20,
            alphaStart: 0.4,
            alphaEnd: 0,
            color: { r: 255, g: 255, b: 255, a: 1 },
            pauseWhenStationary: true,
            stationaryThreshold: 10
        },
        laser: {
            duration: 0.05,
            maxPoints: 20,
            minDistance: 0.4,
            maxInterval: 0.01,
            widthStart: 16,
            widthEnd: 4,
            alphaStart: 0.4,
            alphaEnd: 0,
            color: { r: 255, g: 128, b: 0, a: 1 },
            pauseWhenStationary: false
        }
    }
}