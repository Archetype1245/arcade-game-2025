class GridBackgroundController extends Component {
    constructor({
        horizonRatio = 0.4,
        fakeCamY = 16,
        scaleX = 400,
        scaleY = 250,

        gridTotalWidth = 100,
        cellsPerRow = 35,

        zNear = 1,
        zFar = 80,
        zHorizon = 40,
        cellsInDepth = 90,

        scrollSpeed = -5
    } = {}) {
        super()

        this.horizonRatio = horizonRatio
        this.fakeCamY = fakeCamY
        this.scaleX = scaleX
        this.scaleY = scaleY

        this.farColor = { r: 0, g: 25, b: 40 }
        this.nearColor = { r: 0, g: 140, b: 150 }

        this.gridTotalWidth = gridTotalWidth
        this.cellsPerRow = cellsPerRow
        this.halfWidth = gridTotalWidth * 0.5
        this.cellSizeX = gridTotalWidth / cellsPerRow

        this.zNear = zNear
        this.zFar = zFar
        this.zHorizon = zHorizon
        this.cellsInDepth = cellsInDepth
        this.cellSizeZ = (zFar - zNear) / cellsInDepth

        this.scrollSpeed = scrollSpeed

        this._scroll = 0
        this._centerX = 0
        this._horizonY = 0
        this._canvasHeight = 0
        this._floorFarY = 0

        // Shape component references
        this.floorPolygon = null
        this.curvedBackPolygon = null
        this.verticalLines = null
        this.horizontalLines = null
    }

    start() {
        // Create floor polygon (trapezoid from zNear to zHorizon)
        this.floorPolygon = new Polygon()
        this.floorPolygon.name = "FloorPolygon"
        this.floorPolygon.strokeStyle = null
        this.gameObject.addComponent(this.floorPolygon)

        // Create curved back polygon (zHorizon to zFar)
        this.curvedBackPolygon = new Polygon()
        this.curvedBackPolygon.name = "CurvedBackPolygon"
        this.curvedBackPolygon.fillStyle = `rgb(${this.farColor.r}, ${this.farColor.g}, ${this.farColor.b})`
        this.curvedBackPolygon.strokeStyle = null
        this.gameObject.addComponent(this.curvedBackPolygon)

        // Create vertical lines (batched with shared gradient)
        this.verticalLines = new LineBatch()
        this.verticalLines.name = "VerticalLines"
        this.verticalLines.batched = true
        this.verticalLines.lineWidth = 2
        this.gameObject.addComponent(this.verticalLines)

        // Create horizontal lines (per-line mode for fading)
        this.horizontalLines = new LineBatch()
        this.horizontalLines.name = "HorizontalLines"
        this.horizontalLines.batched = false
        this.horizontalLines.lineWidth = 2
        this.gameObject.addComponent(this.horizontalLines)

        this._setupStyles()
    }

    _setupStyles() {
        // Floor: vertical gradient from canvasHeight to floorFarY
        // Transition from nearColor to farColor completes around zHorizon/3
        this.floorPolygon.fillStyle = (ctx) => {
            const zFadeEnd = this.zHorizon / 3
            const fadeEndY = this._projectPointFlat(0, zFadeEnd).y

            // Gradient from bottom of canvas to top of floor polygon
            const y0 = this._canvasHeight
            const y1 = this._floorFarY

            const grad = ctx.createLinearGradient(0, y0, 0, y1)

            // At y0 (canvas bottom): near color
            grad.addColorStop(0, `rgb(${this.nearColor.r}, ${this.nearColor.g}, ${this.nearColor.b})`)

            // Calculate where fadeEnd falls as a normalized stop
            const fadeRatio = MathUtils.clamp01((y0 - fadeEndY) / (y0 - y1))

            // At fadeRatio: far color (transition complete)
            grad.addColorStop(fadeRatio, `rgb(${this.farColor.r}, ${this.farColor.g}, ${this.farColor.b})`)

            // At y1 (floor far edge): still far color
            grad.addColorStop(1, `rgb(${this.farColor.r}, ${this.farColor.g}, ${this.farColor.b})`)

            return grad
        }

        // Vertical lines: screen-space vertical gradient
        this.verticalLines.strokeStyle = (ctx) => {
            const grad = ctx.createLinearGradient(0, this._canvasHeight, 0, this._horizonY)
            grad.addColorStop(0.0, `rgba(200, 255, 255, 1)`)
            grad.addColorStop(0.5, `rgba(100, 127, 127, 0.5)`)
            grad.addColorStop(0.675, `rgba(0, 25, 40, 0)`)
            return grad
        }

        // Horizontal lines: per-line alpha based on z depth
        this.horizontalLines.strokeStyle = (ctx, seg, i) => {
            const alpha = this._lineAlphaForZ(seg.data.z)
            return `rgba(200, 255, 255, ${alpha})`
        }
    }

    update() {
        this._scroll += this.scrollSpeed * Time.deltaTime

        // Compute layout parameters from canvas dimensions
        const w = Engine.canvas.width
        const h = Engine.canvas.height
        this._centerX = w * 0.5
        this._horizonY = h * this.horizonRatio
        this._canvasHeight = h

        let scrollOffset = this._scroll % this.cellSizeZ
        if (scrollOffset < 0) scrollOffset += this.cellSizeZ

        // Update geometry for all shape components
        this._updateFloorGeometry()
        this._updateCurvedBackGeometry()
        this._updateVerticalLinesGeometry()
        this._updateHorizontalLinesGeometry(scrollOffset)
    }

    _projectPointFlat(x, z) {
        if (Math.abs(z) < MathUtils.EPS) z += MathUtils.EPS
        const invZ = 1 / z

        const sx = this._centerX + x * (this.scaleX * invZ)
        const sy = this._horizonY + this.fakeCamY * (this.scaleY * invZ)

        return new Vector2(sx, sy)
    }

    _projectPointCurved(x, z) {
        const p = this._projectPointFlat(x, z)
        let sx = p.x
        let sy = p.y

        const depthFactor = MathUtils.clamp01((z - this.zHorizon) / (this.zFar - this.zHorizon))
        const depthPower = 2
        const f = Math.pow(depthFactor, depthPower)

        const maxBendPixels = this._canvasHeight * 0.5
        const bend = maxBendPixels * f

        sy -= bend

        return new Vector2(sx, sy)
    }

    _lineAlphaForZ(z) {
        const t = MathUtils.clamp01((z - this.zNear) / (this.zHorizon / 3 - this.zNear))
        return 1 - t
    }

    _updateFloorGeometry() {
        const nearLeft = this._projectPointFlat(-this.halfWidth, this.zNear)
        const nearRight = this._projectPointFlat(+this.halfWidth, this.zNear)
        const farRight = this._projectPointFlat(+this.halfWidth, this.zHorizon)
        const farLeft = this._projectPointFlat(-this.halfWidth, this.zHorizon)

        this.floorPolygon.points = [nearLeft, nearRight, farRight, farLeft]
        this.floorPolygon.markDirty()

        // Store for gradient computation (projected Y at zHorizon)
        this._floorFarY = farLeft.y
    }

    _updateCurvedBackGeometry() {
        const steps = 40
        const leftPoints = []
        const rightPoints = []

        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const z = this.zHorizon + t * (this.zFar - this.zHorizon)

            leftPoints.push(this._projectPointCurved(-this.halfWidth, z))
            rightPoints.push(this._projectPointCurved(+this.halfWidth, z))
        }

        // Build single polygon: left side forward, then right side backward
        const points = []
        for (let i = 0; i < leftPoints.length; i++) {
            points.push(leftPoints[i])
        }
        for (let i = rightPoints.length - 1; i >= 0; i--) {
            points.push(rightPoints[i])
        }

        this.curvedBackPolygon.points = points
        this.curvedBackPolygon.markDirty()
    }

    _updateVerticalLinesGeometry() {
        const segments = []

        for (let i = 0; i <= this.cellsPerRow; i++) {
            const x = -this.halfWidth + i * this.cellSizeX
            const pNear = this._projectPointFlat(x, this.zNear)
            const pHor = this._projectPointFlat(x, this.zHorizon)

            segments.push({ a: pNear, b: pHor })
        }

        this.verticalLines.segments = segments
        this.verticalLines.markDirty()
    }

    _updateHorizontalLinesGeometry(scrollOffset) {
        const segments = []
        const maxRow = Math.min(20, this.cellsInDepth)

        for (let row = 0; row <= maxRow; row++) {
            const z = this.zNear + row * this.cellSizeZ + scrollOffset

            if (z > this.zHorizon) continue

            const left = this._projectPointFlat(-this.halfWidth, z)
            const right = this._projectPointFlat(+this.halfWidth, z)

            segments.push({ a: left, b: right, data: { z } })
        }

        this.horizontalLines.segments = segments
        this.horizontalLines.markDirty()
    }
}