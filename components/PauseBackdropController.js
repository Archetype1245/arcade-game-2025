class PauseBackdropController extends Component {
  constructor({
    dimAlpha = 0.25,      // overall dim over the whole viewport

    stripHeight = 260,
    stripMidAlpha = 0.8,
    stripEdgeAlpha = 0,
    color = { r: 0, g: 0, b: 0 }
  } = {}) {
    super()
    Object.assign(this, { dimAlpha, stripHeight, stripMidAlpha, stripEdgeAlpha, color })

    this._dimPoly = null
    this._stripPoly = null

    this._lastW = -1
    this._lastH = -1
    this._lastUIScale = -1
  }

  start() {
    this._dimPoly = this.gameObject.addComponent(new Polygon(), {
      points: [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(1, 1), new Vector2(-1, 1)],
      fill: true,
      strokeStyle: null,
      fillStyle: `rgba(0,0,0,${this.dimAlpha})`,
      closePath: true,
    })

    this._stripPoly = this.gameObject.addComponent(new Polygon(), {
      points: [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(1, 1), new Vector2(-1, 1)],
      fill: true,
      strokeStyle: null,
      fillStyle: (ctx) => this._createGradient(ctx),
      closePath: true,
    })

    this._rebuildRectsIfNeeded(true)
  }

  update() {
    // Rebuild when viewport size or UI scale changes
    this._rebuildRectsIfNeeded(false)
  }

  _rebuildRectsIfNeeded(force) {
    const cam = SceneManager.currentScene?.activeCamera
    if (!cam) return

    const vp = cam.getViewportRect()
    const uiScale = UIScale.scale || 1

    const w = vp.width / uiScale
    const h = vp.height / uiScale

    if (!force && w === this._lastW && h === this._lastH && uiScale === this._lastUIScale) return

    this._lastW = w
    this._lastH = h
    this._lastUIScale = uiScale

    // Dim entire viewport
    this._setRectPoints(this._dimPoly, w, h)

    // Backdrop strip (add visibility to the menu screen)
    this._setRectPoints(this._stripPoly, w, this.stripHeight)
  }

  _setRectPoints(poly, w, h) {
    if (!poly) return
    const hw = w * 0.5
    const hh = h * 0.5

    poly.points = [
      new Vector2(-hw, -hh),
      new Vector2( hw, -hh),
      new Vector2( hw,  hh),
      new Vector2(-hw,  hh),
    ]
    poly.markDirty()
  }

  _createGradient(ctx) {
    const hh = this.stripHeight * 0.5

    const g = ctx.createLinearGradient(0, -hh, 0, hh)

    g.addColorStop(0.00, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.stripEdgeAlpha})`)
    g.addColorStop(0.35, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.stripMidAlpha})`)
    g.addColorStop(0.50, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.stripMidAlpha})`)
    g.addColorStop(0.65, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.stripMidAlpha})`)
    g.addColorStop(1.00, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.stripEdgeAlpha})`)

    return g
  }
}
