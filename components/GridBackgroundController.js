class GridBackgroundController extends Component {
    constructor({
        horizonRatio = 0.4,
        fakeCamY = 16,
        scaleX = 400,
        scaleY = 250,

        gridTotalWidth = 100,  // full width in world units
        cellsPerRow = 35,      // number of columns across

        zNear = 1,
        zFar = 80,
        zHorizon = 40,
        cellsInDepth = 90,     // how many rows from near to far

        scrollSpeed = -5,
        lineAlpha = 1,
        stripsAlpha = 0.5,
    } = {}) {
        super()

        this.horizonRatio = horizonRatio
        this.fakeCamY = fakeCamY
        this.scaleX = scaleX
        this.scaleY = scaleY

        this.farColor = { r: 0, g: 25, b: 40 }
        this.nearColor = { r: 0, g: 240, b: 255 }

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
        this.lineAlpha = lineAlpha
        this.stripsAlpha = stripsAlpha

        this._scroll = 0
        this._centerX = 0
        this._horizonY = 0
    }

    start() {
    }

    update() {
        this._scroll += this.scrollSpeed * Time.deltaTime
    }

    draw(ctx) {
        ctx.save()
        // Ignores camera transform (draws in screen space)  TODO: adjust layer system to handle screen space layers behind others?
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        const w = ctx.canvas.width
        const h = ctx.canvas.height

        this._centerX = w * 0.5
        this._horizonY = h * this.horizonRatio

        let scrollOffset = this._scroll % this.cellSizeZ
        if (scrollOffset < 0) scrollOffset += this.cellSizeZ

        ctx.lineWidth = 2;
        this._drawStrips(ctx, scrollOffset)
        this._drawVerticalLines(ctx, h)
        this._drawHorizontalLines(ctx, scrollOffset)
        this._drawCurvedPath(ctx, h)

        ctx.restore()
    }

    _projectPointFlat(x, z) {
        if (Math.abs(z) < MathUtils.EPS) z += MathUtils.EPS
        const invZ = 1 / z

        const sx = this._centerX + x * (this.scaleX * invZ)
        const sy = this._horizonY + this.fakeCamY * (this.scaleY * invZ)

        return { x: sx, y: sy }
    }

    _projectPointCurved(x, z, h) {
        const p = this._projectPointFlat(x, z)
        let sx = p.x
        let sy = p.y

        const depthFactor = MathUtils.clamp01((z - this.zHorizon) / (this.zFar - this.zHorizon))
        const depthPower = 2
        const f = Math.pow(depthFactor, depthPower)

        const maxBendPixels = h * 0.5
        const bend = maxBendPixels * f

        sy -= bend

        return { x: sx, y: sy }
    }

    _stripColorForZ(zMid) {
        const t = MathUtils.clamp01((zMid - this.zNear) / (this.zHorizon / 3 - this.zNear))

        const a = this.stripsAlpha + (1 - this.stripsAlpha) * t
        const r = this.nearColor.r + (this.farColor.r - this.nearColor.r) * t
        const g = this.nearColor.g + (this.farColor.g - this.nearColor.g) * t
        const b = this.nearColor.b + (this.farColor.b - this.nearColor.b) * t
        return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    _lineAlphaForZ(z) {
        const t = MathUtils.clamp01((z - this.zNear) / (this.zHorizon / 3 - this.zNear))
        return 1 - t
    }

    _drawStrips(ctx, scrollOffset) {
        for (let row = 0; row < this.cellsInDepth; row++) {
            const baseZ = this.zNear + row * this.cellSizeZ
            const z0 = baseZ + scrollOffset
            const z1 = z0 + this.cellSizeZ
            const zMid = (z0 + z1) * 0.5

            // Skip if entire strip is past horizon
            if (z0 > this.zHorizon) continue

            const clampedMid = Math.min(zMid, this.zHorizon)

            const leftFront =  this._projectPointFlat(-this.halfWidth, z0)
            const rightFront = this._projectPointFlat(+this.halfWidth, z0)
            const rightBack =  this._projectPointFlat(+this.halfWidth, Math.min(z1, this.zHorizon))
            const leftBack =   this._projectPointFlat(-this.halfWidth, Math.min(z1, this.zHorizon))

            ctx.beginPath()
            ctx.moveTo(leftFront.x, leftFront.y)
            ctx.lineTo(rightFront.x, rightFront.y)
            ctx.lineTo(rightBack.x, rightBack.y)
            ctx.lineTo(leftBack.x, leftBack.y)
            ctx.closePath()

            ctx.fillStyle = this._stripColorForZ(clampedMid)
            ctx.fill()
        }
    }

    _drawHorizontalLines(ctx, scrollOffset) {
        for (let row = 0; row <= this.cellsInDepth; row++) {
            const z = this.zNear + row * this.cellSizeZ + scrollOffset

            // Lines start bright and fade to match farColor (to blend in completely)
            if (row < 20) {
                const alpha = this._lineAlphaForZ(z)
                ctx.strokeStyle = `rgba(200, 255, 255, ${alpha})`
            } else { ctx.strokeStyle = `rgba(0, 25, 40, 1)` }

            const left = this._projectPointFlat(-this.halfWidth, z)
            const right = this._projectPointFlat(+this.halfWidth, z)

            ctx.beginPath()
            ctx.moveTo(left.x, left.y)
            ctx.lineTo(right.x, right.y)
            ctx.stroke()
        }
    }

    _drawVerticalLines(ctx, h) {
        for (let i = 0; i <= this.cellsPerRow; i++) {
            const x = -this.halfWidth + i * this.cellSizeX

            const pNear = this._projectPointFlat(x, this.zNear)
            const pHor  = this._projectPointFlat(x, this.zHorizon)

            // Line color starts bright and fades out to a 0-alpha farColor
            const grad = ctx.createLinearGradient(0, h, 0, this._horizonY)
            grad.addColorStop(0.0, `rgba(200,255,255, 1)`)
            grad.addColorStop(0.5, `rgba(100,127,127, 0.5)`)
            grad.addColorStop(0.75, `rgba(0, 25, 40, 0)`)

            ctx.strokeStyle = grad
            ctx.beginPath()
            ctx.moveTo(pNear.x, pNear.y)
            ctx.lineTo(pHor.x, pHor.y)
            ctx.stroke()
        }
    }

    _drawCurvedPath(ctx, h) {
        const steps = 40
        const leftPoints = []
        const rightPoints = []

        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const z = this.zHorizon + t * (this.zFar - this.zHorizon)

            const left  = this._projectPointCurved(-this.halfWidth, z, h)
            const right = this._projectPointCurved(+this.halfWidth, z, h)

            leftPoints.push(left)
            rightPoints.push(right)
        }

        ctx.beginPath()
        // Start at left side of horizon and then move up the left side of the curve
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y)
        for (let i = 1; i < leftPoints.length; i++) {
            ctx.lineTo(leftPoints[i].x, leftPoints[i].y)
        }
        // At the top, start again at the top of the right-side of the curve, and move down
        for (let i = rightPoints.length - 1; i >= 0; i--) {
            ctx.lineTo(rightPoints[i].x, rightPoints[i].y)
        }
        ctx.closePath()

        ctx.fillStyle = `rgba(${this.farColor.r}, ${this.farColor.g}, ${this.farColor.b}, 1)`
        ctx.fill()
    }
}
