class LightBeam extends Component {
  constructor({
    color = Config.beamColors.purpleBeam,
    duration = 1,
    width = 10,

    beamGlow = 18,
    baseGlowRadius = 40,
    baseGlowPulse = 0.0,

    pulseStart = 0.25,
    pulseEnd = 0.90,
    pulseLength = 0.03,
    pulseAlpha = 0.95,
    pulseGlow = 22,

    maxAlpha = 0.85,
    length = 0,
    started = false,
    onComplete = null,
  } = {}) {

    super()
    Object.assign(this, {
      color, duration, width,
      beamGlow, baseGlowRadius, baseGlowPulse,
      pulseStart, pulseEnd, pulseLength, pulseAlpha, pulseGlow,
      maxAlpha, length, onComplete
    })

    this._L = Math.max(1, length || Math.hypot(Engine.canvas.width, Engine.canvas.height))
  }

  start() {
    this.started = true
    this._retarget()    // Initial direction

    this._transition = Engine.animation.add(new Transition({
      from: 0.100,
      to: 0.600,
      duration: this.duration,
      easing: t => t * t * (3 - 2 * t),
      lerp: (a, b, t) => {
        const spike = this.maxAlpha
        const rampEnd = 0.90

        if (t <= 0) return 0
        if (t < rampEnd) {
          const p = t / rampEnd
          return a + (b - a) * p
        }
        const p = (t - rampEnd) / (1 - rampEnd)
        return spike - (spike - a) * p
      },
      onUpdate: (alpha, u) => {
        this.alpha = alpha
        this.t = u

      },
      onComplete: () => {
        this.onComplete()
        this.gameObject.markForDelete = true
      }
    }))
  }

  update() {
    this._retarget()        // Keep pointing away from the player
  }

  _retarget() {
    const player = GameObject.getObjectByName("PlayerGameObject")
    if (!player) return

    const pW = player.transform.worldPosition
    const bW = this.transform.worldPosition
    const dir = bW.getDirectionVector(pW)
    // Draw beam in the opposite direction of the player GO - just setting the rotation to match the angle
    this.gameObject.transform.rotation = Math.atan2(dir.y, dir.x)
    this._aimed = true
  }

  draw(ctx) {
    if (!this.started || this._L <= 0) return
    const p = this.t ?? 0
    const L = this._L
    const halfW = this.width * 0.5

    const bctx = Engine.bctx
    Engine.bufferCanvas.width = L
    Engine.bufferCanvas.height = this.width

    // Circular glow at base
    ctx.save();
    const R = this.baseGlowRadius
    const baseGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
    baseGrad.addColorStop(0.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0.40))
    baseGrad.addColorStop(0.50, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0.20))
    baseGrad.addColorStop(0.75, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0.10))
    baseGrad.addColorStop(1.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0.00))

    ctx.globalAlpha = this.alpha
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, 2 * Math.PI)
    ctx.fill()

    // Create the beam on the buffer canvas to easily mix multiple alpha gradients without affecting the main canvas
    // Beam color gradients
    bctx.save()
    bctx.globalAlpha = this.alpha;

    const xGrad = bctx.createLinearGradient(0, 0, L, 0)
    xGrad.addColorStop(0.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0))
    xGrad.addColorStop(0.40, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 1))

    const spikeGrad = bctx.createLinearGradient(0, 0, L, 0)
    spikeGrad.addColorStop(0.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0))
    spikeGrad.addColorStop(0.15, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 1))

    bctx.fillStyle = p < this.pulseEnd ? xGrad : spikeGrad
    bctx.fillRect(0, 0, L, this.width)

    // Pulse
    if (p > this.pulseStart && p < this.pulseEnd) {
      const u = (p - this.pulseStart) / (this.pulseEnd - this.pulseStart)
      const w = this.pulseLength * L
      const left = Math.max(0, L - u * L)
      const right = Math.min(left + w, L)
      const win = right - left

      const pulseGrad = bctx.createLinearGradient(left, 0, right, 0)
      pulseGrad.addColorStop(0.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0))
      pulseGrad.addColorStop(0.50, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 1))
      pulseGrad.addColorStop(1.00, this.rgba({r:this.color.r, g:this.color.g, b:this.color.b}, 0))

      bctx.globalAlpha = this.pulseAlpha
      bctx.fillStyle = this.color
      bctx.fillRect(left, 0, win, this.width)
    }

    if (p > this.pulseEnd) {
      this.drawWhiteCore(bctx, L, this.width, {
        base: 0.8*this.width,
        len: 0.2*L,
        k: 16
      })
    }

    // Alpha Gradient/Mask
    bctx.globalCompositeOperation = "destination-in"       // per-pixel: destination color * source alpha
    bctx.globalAlpha = 1

    const yAlphaMask = bctx.createLinearGradient(0, 0, 0, this.width)
    yAlphaMask.addColorStop(0.00, "rgba(0,0,0,0)")
    yAlphaMask.addColorStop(0.50, "rgba(0,0,0,0.5)")
    yAlphaMask.addColorStop(1.00, "rgba(0,0,0,0)")

    const yAlphaMaskSpike = bctx.createLinearGradient(0, 0, 0, this.width)
    yAlphaMaskSpike.addColorStop(0.00, "rgba(0,0,0,0)")
    yAlphaMaskSpike.addColorStop(0.30, "rgba(0,0,0,0)")
    yAlphaMaskSpike.addColorStop(0.50, "rgba(0,0,0,1)")
    yAlphaMaskSpike.addColorStop(0.70, "rgba(0,0,0,0)")
    yAlphaMaskSpike.addColorStop(1.00, "rgba(0,0,0,0)")

    bctx.fillStyle = p < this.pulseEnd ? yAlphaMask : yAlphaMaskSpike
    bctx.fillRect(0, 0, L, this.width)
    bctx.restore()


    ctx.shadowColor = this.color
    ctx.shadowBlur = this.beamGlow
    ctx.globalAlpha = 1
    ctx.drawImage(Engine.bufferCanvas, 0, -halfW)     // Draw the beam on the main canvas
    ctx.restore()
  }


  static play(spawnPos, {
    scene = SceneManager.currentScene,
    layer = Config.layers.enemies,
    ...opts
  } = {}) {
    return new Promise(resolve => {
      const go = new LightBeamGameObject()
      GameObject.instantiate(go, {
        scene,
        layer,
        position: new Vector2(spawnPos.x, spawnPos.y)
      })
      go.addComponent(new LightBeam({ ...opts, onComplete: resolve }))
    })
  }

  rgba({r,g,b}, a) {
    return `rgba(${r},${g},${b},${a})`
  }

  drawWhiteCore(bctx, W, H, {
    base = 0.75*H,
    len  = 0.28*W,
    k    = 14,    
  } = {}) {
    const cy = H/2, L = Math.max(1, Math.round(len))
    const samples = 80

    const half = x => (base*0.5) / (1 + k * (x/L) * (x/L))

    const path = new Path2D()
    path.moveTo(0, cy - half(0))
    for (let i=1;i<=samples;i++){
      const x = (i/samples)*L
      path.lineTo(x, cy - half(x))
    }
    for (let i=samples;i>=0;i--){
      const x = (i/samples)*L
      path.lineTo(x, cy + half(x))
    }
    path.closePath()

    const g = bctx.createLinearGradient(0,0,L,0)
    g.addColorStop(0.00, `rgba(255,255,255,1)`)
    g.addColorStop(1.00, `rgba(255,255,255,0)`)

    bctx.save()
    bctx.fillStyle = g
    bctx.fill(path)
    bctx.restore()
  }
}