class DistortionGridController extends Component {
    cellSize = 100
    bounds = Config.Playable

    // Grid "snappiness"
    springK = 10.0
    damping = 0.01

    influenceRadius = 300
    softeningRadius = 40
    maxDisplacement = 30
    objectWeight = 30000
    pullMode = false      // Thought this would be neat for "black hole" type objects, but would take too long to implement

    influenceSearchRadius = 1300

    maxInfluencers = 150

    drawCells = true

    // Full color intensity at this (absolute) value
    maxDivergence = 0.5

    drawLines = true
    lineBaseColor = [0, 255, 255]
    lineBaseAlpha = 0.12
    lineGlowAlpha = 0.25
    lineWidth = 1

    // Reduce jitter
    energySmoothFactor = 1

    influenceTags = ["player", "enemy"]

    // Experimenting with HSLA colors
    _colorConfig = {
        compressionHue: 180,      // Teal    (negative divergence)
        expansionHue: 295,        // Purple  (positive divergence)
        saturation: 100,
        minLightness: 10,
        maxLightness: 55,
        minAlpha: 0.03,
        maxAlpha: 0.45
    }

    _tagWeights = {
        player: 100.0,
        enemy: 50.0,
        laser: 0.3
    }

    // TODO: Refactor other classes to match this method for object defaults to prevent overwrites with partial objects
    get colorConfig() { return this._colorConfig }
    set colorConfig(value) {
        if (value && typeof value === 'object') {
            Object.assign(this._colorConfig, value)
        }
    }

    get tagWeights() { return this._tagWeights }
    set tagWeights(value) {
        if (value && typeof value === 'object') {
            Object.assign(this._tagWeights, value)
        }
    }

    constructor() {
        super()

        this._cellRenderer = null
        this._lineRenderer = null

        // Reusable collections
        this._influencers = []
        this._tagSet = null

        this._shockwaves = []

        this.cols = 0
        this.rows = 0
        this.nodeCount = 0
        this.cellCount = 0

        // Reusable node arrays
        this.restX = null
        this.restY = null
        this.posX = null
        this.posY = null
        this.velX = null
        this.velY = null

        this.cellDivergences = null
        this.smoothedDivergences = null
    }

    start() {
        this._initGrid()
        this._initRenderers()
        this._tagSet = new Set(this.influenceTags)

        const player = GameObject.getObjectsByTag("player")[0]
        this.spawnShockwave(player.transform.position.x, player.transform.position.y, {
            strength: 50000,
            speed: 600,     
            width: 300,     
            decay: 2.0,     
            oscillate: true,
        })
    }

    _initGrid() {
        const b = this.bounds
        const cs = this.cellSize

        this.cols = Math.ceil(b.w / cs) + 1
        this.rows = Math.ceil(b.h / cs) + 1
        this.nodeCount = this.cols * this.rows
        this.cellCount = (this.cols - 1) * (this.rows - 1)

        // Typed arrays for performance here
        this.restX = new Float32Array(this.nodeCount)
        this.restY = new Float32Array(this.nodeCount)
        this.posX  = new Float32Array(this.nodeCount)
        this.posY  = new Float32Array(this.nodeCount)
        this.velX  = new Float32Array(this.nodeCount)
        this.velY  = new Float32Array(this.nodeCount)

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                const idx = j * this.cols + i
                const x = b.x1 + i * cs
                const y = b.y1 + j * cs

                this.restX[idx] = x
                this.restY[idx] = y
                this.posX[idx] = x
                this.posY[idx] = y
            }
        }

        this.cellDivergences = new Float32Array(this.cellCount)
        this.smoothedDivergences = new Float32Array(this.cellCount)
    }

    _initRenderers() {
        const cols = this.cols
        const rows = this.rows
        const cellCols = cols - 1

        const cells = []
        for (let j = 0; j < rows - 1; j++) {
            const nodeRowBase = j * cols
            for (let i = 0; i < cellCols; i++) {
                const tl = nodeRowBase + i
                const tr = tl + 1
                const bl = tl + cols
                const br = bl + 1

                cells.push({
                    tl, tr, br, bl,
                    cellIdx: j * cellCols + i
                })
            }
        }

        this._cellRenderer = this.gameObject.addComponent(new QuadBatch(), {
            cells,
            posX: this.posX,
            posY: this.posY,
            hidden: !this.drawCells,
            fillStyle: (ctx, cell) => this._getCellFillStyle(cell)
        })

        const segments = []

        // Horizontal segments
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols - 1; i++) {
                segments.push({
                    a: { x: 0, y: 0 },
                    b: { x: 0, y: 0 },
                    data: { type: 'h', row: j }
                })
            }
        }

        // Vertical segments
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows - 1; j++) {
                segments.push({
                    a: { x: 0, y: 0 },
                    b: { x: 0, y: 0 },
                    data: { type: 'v', col: i }
                })
            }
        }

        this._lineRenderer = this.gameObject.addComponent(new LineBatch(), {
            segments,
            hidden: !this.drawLines,
            batched: false,
            lineWidth: this.lineWidth,
            strokeStyle: (ctx, seg) => this._getLineStrokeStyle(seg)
        })
    }

    update(dt) {
        this._gatherInfluencers()
        this._applyInfluenceForces(dt)
        this._applyShockwaves(dt)
        this._integratePhysics(dt)
        this._computeCellDivergences(dt)
        this._updateRenderers()
    }

    _gatherInfluencers() {
        const influencers = this._influencers
        influencers.length = 0

        const player = GameObject.getObjectsByTag("player")[0]
        if (!player) return

        const p = player.transform._position
        const scene = SceneManager.currentScene

        // Grab all influencers within given radius of the player (since this is where the camera is)
        scene.spatialMap.searchRadiusMultiTag(
            p.x, p.y,
            this.influenceSearchRadius,
            this._tagSet,
            influencers
        )

        if (influencers.length > this.maxInfluencers) {
            influencers.length = this.maxInfluencers
        }
    }

    _applyInfluenceForces(dt) {
        const influencers = this._influencers
        const r = this.influenceRadius
        const r2 = r * r
        const soft2 = this.softeningRadius * this.softeningRadius
        const baseWeight = this.objectWeight
        const sign = this.pullMode ? -1 : 1
        const b = this.bounds
        const cs = this.cellSize
        const cols = this.cols
        const tagWeights = this._tagWeights

        for (let k = 0; k < influencers.length; k++) {
            const obj = influencers[k]
            const p = obj.transform._position
            const ox = p.x
            const oy = p.y

            const tagMult = tagWeights[obj.tag] ?? 1.0
            const weight = baseWeight * tagMult

            const minI = Math.max(0, Math.floor((ox - r - b.x1) / cs))
            const maxI = Math.min(this.cols - 1, Math.ceil((ox + r - b.x1) / cs))
            const minJ = Math.max(0, Math.floor((oy - r - b.y1) / cs))
            const maxJ = Math.min(this.rows - 1, Math.ceil((oy + r - b.y1) / cs))

            for (let j = minJ; j <= maxJ; j++) {
                const rowBase = j * cols
                for (let i = minI; i <= maxI; i++) {
                    const idx = rowBase + i

                    const dx = this.posX[idx] - ox
                    const dy = this.posY[idx] - oy
                    const dist2 = dx * dx + dy * dy

                    if (dist2 > r2) continue

                    const dist = Math.sqrt(dist2)
                    if (dist < 0.0001) continue

                    const forceMag = weight / (dist2 + soft2)

                    const invDist = 1 / dist
                    const nx = dx * invDist
                    const ny = dy * invDist

                    this.velX[idx] += sign * nx * forceMag * dt
                    this.velY[idx] += sign * ny * forceMag * dt
                }
            }
        }
    }

    _integratePhysics(dt) {
        const k = this.springK
        const maxDisp = this.maxDisplacement
        const maxDisp2 = maxDisp * maxDisp
        const dampFactor = Math.pow(this.damping, dt)

        for (let i = 0; i < this.nodeCount; i++) {
            const dx = this.restX[i] - this.posX[i]
            const dy = this.restY[i] - this.posY[i]

            this.velX[i] += dx * k * dt
            this.velY[i] += dy * k * dt

            this.velX[i] *= dampFactor
            this.velY[i] *= dampFactor

            this.posX[i] += this.velX[i] * dt
            this.posY[i] += this.velY[i] * dt

            const dispX = this.posX[i] - this.restX[i]
            const dispY = this.posY[i] - this.restY[i]
            const disp2 = dispX * dispX + dispY * dispY

            if (disp2 > maxDisp2) {
                const scale = maxDisp / Math.sqrt(disp2)
                this.posX[i] = this.restX[i] + dispX * scale
                this.posY[i] = this.restY[i] + dispY * scale
                this.velX[i] *= 0.5
                this.velY[i] *= 0.5
            }
        }
    }

    /**
     * Divergence = du/dx + dv/dy where (u, v) is the displacement field.
     * 
     * For a cell with corners TL, TR, BL, BR:
     *   du/dx = (avg_right - avg_left) / cellSize
     *         = ((uTR + uBR) - (uTL + uBL)) / (2 * cellSize)
     *   dv/dy = (avg_bottom - avg_top) / cellSize  
     *         = ((vBL + vBR) - (vTL + vTR)) / (2 * cellSize)
     * 
     * Positive divergence = expansion (nodes moving apart)
     * Negative divergence = compression (nodes moving together)
     */
    _computeCellDivergences(dt) {
        const smooth = 1 - Math.pow(1 - this.energySmoothFactor, dt * 60)
        const cellCols = this.cols - 1
        const cols = this.cols
        const cs = this.cellSize
        const invTwoCS = 1 / (2 * cs)

        for (let j = 0; j < this.rows - 1; j++) {
            const cellRowBase = j * cellCols
            const nodeRowBase = j * cols

            for (let i = 0; i < cellCols; i++) {
                const cellIdx = cellRowBase + i

                // Corner node indices
                const tl = nodeRowBase + i
                const tr = tl + 1
                const bl = tl + cols
                const br = bl + 1

                // Displacement at each corner
                const uTL = this.posX[tl] - this.restX[tl]
                const uTR = this.posX[tr] - this.restX[tr]
                const uBL = this.posX[bl] - this.restX[bl]
                const uBR = this.posX[br] - this.restX[br]

                const vTL = this.posY[tl] - this.restY[tl]
                const vTR = this.posY[tr] - this.restY[tr]
                const vBL = this.posY[bl] - this.restY[bl]
                const vBR = this.posY[br] - this.restY[br]

                // Divergence using central differences
                const dudx = ((uTR + uBR) - (uTL + uBL)) * invTwoCS
                const dvdy = ((vBL + vBR) - (vTL + vTR)) * invTwoCS

                const divergence = dudx + dvdy

                this.cellDivergences[cellIdx] = divergence
                this.smoothedDivergences[cellIdx] +=
                    (divergence - this.smoothedDivergences[cellIdx]) * smooth
            }
        }
    }

    _updateRenderers() {
        const cols = this.cols
        const rows = this.rows

        const segments = this._lineRenderer.segments
        let segIdx = 0

        // Horizontal segments
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols - 1; i++) {
                const nodeA = j * cols + i
                const nodeB = nodeA + 1

                segments[segIdx].a.x = this.posX[nodeA]
                segments[segIdx].a.y = this.posY[nodeA]
                segments[segIdx].b.x = this.posX[nodeB]
                segments[segIdx].b.y = this.posY[nodeB]
                segIdx++
            }
        }

        // Vertical segments
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows - 1; j++) {
                const nodeA = j * cols + i
                const nodeB = nodeA + cols

                segments[segIdx].a.x = this.posX[nodeA]
                segments[segIdx].a.y = this.posY[nodeA]
                segments[segIdx].b.x = this.posX[nodeB]
                segments[segIdx].b.y = this.posY[nodeB]
                segIdx++
            }
        }
    }

    _getLineStrokeStyle(seg) {
        const [r, g, b] = this.lineBaseColor
        const maxDiv = this.maxDivergence
        const cellCols = this.cols - 1

        let avgDivergence = 0
        const data = seg.data

        if (data.type === 'h') {
            // Horizontal segment: average (abs) divergence across this row's cells
            const j = data.row
            if (j < this.rows - 1) {
                const cellRowBase = j * cellCols
                for (let i = 0; i < cellCols; i++) {
                    avgDivergence += Math.abs(this.smoothedDivergences[cellRowBase + i])
                }
                avgDivergence /= cellCols
            }
        } else {
            // Vertical segment: average (abs) divergence down this column's cells
            const i = data.col
            if (i < cellCols) {
                for (let j = 0; j < this.rows - 1; j++) {
                    avgDivergence += Math.abs(this.smoothedDivergences[j * cellCols + i])
                }
                avgDivergence /= (this.rows - 1)
            }
        }

        const t = Math.min(1, avgDivergence / maxDiv)
        const alpha = this.lineBaseAlpha + t * this.lineGlowAlpha

        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    _getCellFillStyle(quad) {
        const div = this.smoothedDivergences[quad.cellIdx]
        const absDiv = Math.abs(div)
        const t = Math.min(1, absDiv / this.maxDivergence)

        if (t < 0.005) return null  // Skip nearly invisible cells

        const cfg = this._colorConfig
        const hue = div < 0 ? cfg.compressionHue : cfg.expansionHue
        const light = cfg.minLightness + t * (cfg.maxLightness - cfg.minLightness)
        const alpha = cfg.minAlpha + t * (cfg.maxAlpha - cfg.minAlpha)

        return `hsla(${hue}, ${cfg.saturation}%, ${light}%, ${alpha})`
    }

    spawnShockwave(x, y, {
        strength = 2500,  
        speed = 900,      
        width = 220,      
        decay = 2.0,      
        oscillate = false,
    } = {}) {
        this._shockwaves.push({ x, y, age: 0, strength, speed, width, decay, oscillate })
    }

    _applyShockwaves(dt) {
        if (!this._shockwaves.length) return

        const b = this.bounds
        const cs = this.cellSize
        const cols = this.cols

        // Distance before wave deletion
        const maxRadius = Math.hypot(b.w, b.h) + 200

        for (let n = this._shockwaves.length - 1; n >= 0; n--) {
            const w = this._shockwaves[n]
            w.age += dt

            const r = w.speed * w.age
            const halfW = 0.5 * w.width
            const outer = r + halfW
            const inner = Math.max(0, r - halfW)

            // Decay over time
            const amp = w.strength * Math.exp(-w.decay * w.age)

            // Destroy wave once it’s offscreen or too weak
            if (outer > maxRadius || amp < 0.5) {
                this._shockwaves.splice(n, 1)
                continue
            }

            // Node bounds to minimize calcs
            const minI = Math.max(0, Math.floor((w.x - outer - b.x1) / cs))
            const maxI = Math.min(this.cols - 1, Math.ceil((w.x + outer - b.x1) / cs))
            const minJ = Math.max(0, Math.floor((w.y - outer - b.y1) / cs))
            const maxJ = Math.min(this.rows - 1, Math.ceil((w.y + outer - b.y1) / cs))

            const outer2 = outer * outer
            const inner2 = inner * inner

            for (let j = minJ; j <= maxJ; j++) {
                const rowBase = j * cols
                for (let i = minI; i <= maxI; i++) {
                    const idx = rowBase + i

                    // Direction from center to current node
                    const dx = this.posX[idx] - w.x
                    const dy = this.posY[idx] - w.y
                    const d2 = dx * dx + dy * dy

                    if (d2 > outer2 || d2 < inner2) continue

                    const d = Math.sqrt(d2)
                    if (d < 0.0001) continue

                    const s = Math.abs(d - r) / halfW
                    if (s >= 1) continue

                    let env = 1 - s                 
                    env = env * env * (3 - 2 * env)  // Smoothed

                    const osc = w.oscillate ? Math.cos(Math.PI * (d - r) / halfW) : 1

                    const dv = amp * env * osc * dt

                    const invD = 1 / d
                    this.velX[idx] += dx * invD * dv
                    this.velY[idx] += dy * invD * dv
                }
            }
        }
    }
}