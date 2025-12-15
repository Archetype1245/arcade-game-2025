class SelectorLineController extends Component {
    side = "left"
    lineWidth = 3
    padPct = 0.03
    padMinPx = 10
    padMaxPx = 20
    length = 140
    alpha = 0.95
    color = { r: 140, g: 255, b: 255 }
    smooth = 25

    _poly = null
    _targetY = 0
    _currentY = 0
    _targetCenterX = 0
    _text = ""
    _font = "48px sans-serif"

    start() {
        this._poly = this.gameObject.addComponent(new Polygon(), {
            points: [new Vector2(0, 0), new Vector2(1, 0)],
            fill: false,
            closePath: false,
            lineWidth: this.lineWidth,
            strokeStyle: (ctx) => this._makeGradient(ctx),
        })

        this._currentY = this.transform.position.y
        this._targetY = this._currentY

        this._rebuildGeometry()
    }

    setTarget({ y, text, font, centerX = 0 }) {
        this._targetY = y
        this._text = text
        this._font = font
        this._targetCenterX = centerX
        this._rebuildGeometry()
    }

    update(dt) {
        // Smoothly move line GO up/down (optional but nice)
        const t = 1 - Math.exp(-this.smooth * dt)
        this._currentY = this._currentY + (this._targetY - this._currentY) * t

        // Place this GO at (centerX, currentY) in menu-local space
        this.transform.position = new Vector2(this._targetCenterX, this._currentY)
    }

    _rebuildGeometry() {
        if (!this._poly) return

        const halfText = 0.5 * this._measureTextLocal(this._text, this._font)

        const pad = this._getPad()
        const len = this.length

        let x0, x1
        if (this.side === "left") {
            // far -> near text
            x0 = -(halfText + pad + len)
            x1 = -(halfText + pad)
        } else {
            // near text -> far
            x0 = +(halfText + pad)
            x1 = +(halfText + pad + len)
        }

        // Update endpoints in local space (y=0 because the GO itself moves)
        this._poly.points[0].setVec(x0, 0)
        this._poly.points[1].setVec(x1, 0)
        this._poly.markDirty()
    }

    _measureTextLocal(text, font) {
        const ctx = Engine.ctx
        ctx.save()
        ctx.font = font
        const wPx = ctx.measureText(text).width
        ctx.restore()

        return wPx
    }

    _getPad() {
        const cam = SceneManager.currentScene.activeCamera
        const vp = cam.getViewportRect()

        const padPxRaw = vp.width * this.padPct
        const padPx = MathUtils.clamp(padPxRaw, this.padMinPx, this.padMaxPx)

        const pxPerLocal = this._pixels()
        return padPx / pxPerLocal
    }

    _pixels() {
        const s = this.transform.worldScale.x ?? 1
        return Math.max(Math.abs(s), MathUtils.EPS)
    }

    _makeGradient(ctx) {
        if (!this._poly || this._poly.points.length < 2) return this._rgba(1)

        const x0 = this._poly.points[0].x
        const x1 = this._poly.points[1].x

        const g = ctx.createLinearGradient(x0, 0, x1, 0)

        // Fade out on the “far” side, solid near the text
        const solid = this._rgba(this.alpha)
        const fade = this._rgba(0)

        if (this.side === "left") {
            g.addColorStop(0.0, fade)   // far
            g.addColorStop(1.0, solid)  // near text
        } else {
            g.addColorStop(0.0, solid)  // near text
            g.addColorStop(1.0, fade)   // far
        }

        return g
    }

    _rgba(a) {
        const { r, g, b } = this.color
        return `rgba(${r},${g},${b},${a})`
    }
}
