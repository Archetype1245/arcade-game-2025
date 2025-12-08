/**
 * LightBeam - A pure controller component for beam effects.
 * Handles state, animation, and targeting. All rendering is delegated to:
 * - Circle component for the base glow
 * - RenderTarget2D component for the beam body
 * 
 * Color format: { r, g, b, a? } where r,g,b are 0-255 and a is optional 0-1
 */
class LightBeam extends Component {
	constructor({
		color = Config.beamColors.purpleBeam,
		duration = 1.2,
		width = 40,

		beamGlow = 18,
		baseGlowRadius = 40,

		pulseStart = 0.25,
		pulseEnd = 0.90,
		pulseLength = 0.03,
		pulseAlpha = 0.95,

		maxAlpha = 0.85,
		length = 0,
		onComplete = null,
	} = {}) {
		super()

		Object.assign(this, {
			color,  // Expected format: { r, g, b, a? }
			duration,
			width,
			beamGlow,
			baseGlowRadius,
			pulseStart,
			pulseEnd,
			pulseLength,
			pulseAlpha,
			maxAlpha,
			length,
			onComplete
		})

		this._L = Math.max(1, length || Math.hypot(Engine.canvas.width / 2, Engine.canvas.height / 2))
		this.player = GameObject.getObjectByName("PlayerGameObject")
		this.started = false
		this.t = 0
		this.alpha = 0

		this._circleComponent = null
		this._renderTarget = null
	}

	/**
	 * Get the base alpha from color, defaulting to 1 if not specified
	 */
	get colorAlpha() {
		return this.color.a ?? 1
	}

	/**
	 * Get the effective alpha (animation alpha * color alpha)
	 */
	get effectiveAlpha() {
		return this.alpha * this.colorAlpha
	}

	/**
	 * Create rgba string from color object
	 * @param {number} a - Alpha value 0-1 (will be multiplied by color.a if present)
	 */
	rgba(a) {
		return `rgba(${this.color.r},${this.color.g},${this.color.b},${a * this.colorAlpha})`
	}

	/**
	 * Create rgb string from color object
	 */
	rgb() {
		return `rgb(${this.color.r},${this.color.g},${this.color.b})`
	}

	start() {
		this.started = true
		this._retarget()

		this._circleComponent = this.gameObject.addComponent(new Circle({
			radius: this.baseGlowRadius,
			fillStyle: (ctx, radius) => this._createBaseGlowGradient(ctx, radius),
			fill: true,
			alpha: 0,
		}))

		this._renderTarget = this.gameObject.addComponent(new RenderTarget2D({
			width: this._L,
			height: this.width,
			renderFn: (ctxOS, w, h) => this._renderBeamBody(ctxOS, w, h),
			anchorX: 0,
			anchorY: 0.5,
			alpha: 1.0,
			shadowColor: this.rgb(),
			shadowBlur: this.beamGlow,
		}))

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
				this.onComplete?.()
				this.gameObject.markForDelete = true
			}
		}))
	}

	update() {
		if (!this.started) return

		this._retarget()

		if (this._circleComponent) {
			this._circleComponent.alpha = this.effectiveAlpha
			this._circleComponent.radius = this.baseGlowRadius
		}

		if (this._renderTarget) {
			const newL = Math.max(1, this.length || Math.hypot(Engine.canvas.width / 2, Engine.canvas.height / 2))
			this._renderTarget.setSize(newL, this.width)
			this._L = newL

			this._renderTarget.shadowColor = this.rgb()
			this._renderTarget.shadowBlur = this.beamGlow
			this._renderTarget.markDirty()
		}
	}

	_retarget() {
		this.player ??= GameObject.getObjectByName("PlayerGameObject")
		if (!this.player) return

		const pW = this.player.transform.worldPosition
		const bW = this.transform.worldPosition
		const dir = bW.getDirectionVector(pW)
		this.gameObject.transform.rotation = Math.atan2(dir.y, dir.x)
	}

	/**
	 * Creates the radial gradient for the base glow circle
	 */
	_createBaseGlowGradient(ctx, radius) {
		const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
		grad.addColorStop(0.00, this.rgba(0.40))
		grad.addColorStop(0.50, this.rgba(0.20))
		grad.addColorStop(0.75, this.rgba(0.10))
		grad.addColorStop(1.00, this.rgba(0.00))
		return grad
	}

	/**
	 * Render callback for the beam body (called by RenderTarget2D)
	 */
	_renderBeamBody(ctxOS, L, H) {
		const p = this.t

		ctxOS.globalAlpha = this.effectiveAlpha

		// Base beam gradient
		const xGrad = ctxOS.createLinearGradient(0, 0, L, 0)
		xGrad.addColorStop(0.00, this.rgba(0))
		xGrad.addColorStop(0.40, this.rgba(1))

		const spikeGrad = ctxOS.createLinearGradient(0, 0, L, 0)
		spikeGrad.addColorStop(0.00, this.rgba(0))
		spikeGrad.addColorStop(0.15, this.rgba(1))

		ctxOS.fillStyle = p < this.pulseEnd ? xGrad : spikeGrad
		ctxOS.fillRect(0, 0, L, H)

		// Pulse effect
		if (p > this.pulseStart && p < this.pulseEnd) {
			const u = (p - this.pulseStart) / (this.pulseEnd - this.pulseStart)
			const pulseW = this.pulseLength * L
			const left = Math.max(0, L - u * L)
			const right = Math.min(left + pulseW, L)
			const windowW = right - left

			const pulseGrad = ctxOS.createLinearGradient(left, 0, right, 0)
			pulseGrad.addColorStop(0.00, this.rgba(0))
			pulseGrad.addColorStop(0.50, this.rgba(1))
			pulseGrad.addColorStop(1.00, this.rgba(0))

			ctxOS.globalAlpha = this.pulseAlpha * this.colorAlpha
			ctxOS.fillStyle = pulseGrad
			ctxOS.fillRect(left, 0, windowW, H)
		}

		// White core after pulse ends
		if (p > this.pulseEnd) {
			this._drawWhiteCore(ctxOS, L, H)
		}

		// Y-axis alpha mask (vertical feathering)
		ctxOS.globalCompositeOperation = "destination-in"
		ctxOS.globalAlpha = 1

		const yMask = ctxOS.createLinearGradient(0, 0, 0, H)
		if (p < this.pulseEnd) {
			yMask.addColorStop(0.00, "rgba(0,0,0,0)")
			yMask.addColorStop(0.50, "rgba(0,0,0,0.5)")
			yMask.addColorStop(1.00, "rgba(0,0,0,0)")
		} else {
			yMask.addColorStop(0.00, "rgba(0,0,0,0)")
			yMask.addColorStop(0.30, "rgba(0,0,0,0)")
			yMask.addColorStop(0.50, "rgba(0,0,0,1)")
			yMask.addColorStop(0.70, "rgba(0,0,0,0)")
			yMask.addColorStop(1.00, "rgba(0,0,0,0)")
		}

		ctxOS.fillStyle = yMask
		ctxOS.fillRect(0, 0, L, H)
	}

	/**
	 * Draw the white core effect at beam origin
	 */
	_drawWhiteCore(ctxOS, W, H) {
		const base = 0.8 * H
		const len = Math.max(1, Math.round(0.2 * W))
		const k = 16
		const cy = H / 2
		const samples = 80

		const half = x => (base * 0.5) / (1 + k * (x / len) * (x / len))

		const path = new Path2D()
		path.moveTo(0, cy - half(0))
		for (let i = 1; i <= samples; i++) {
			const x = (i / samples) * len
			path.lineTo(x, cy - half(x))
		}
		for (let i = samples; i >= 0; i--) {
			const x = (i / samples) * len
			path.lineTo(x, cy + half(x))
		}
		path.closePath()

		const grad = ctxOS.createLinearGradient(0, 0, len, 0)
		grad.addColorStop(0.00, `rgba(255,255,255,${this.colorAlpha})`)
		grad.addColorStop(1.00, "rgba(255,255,255,0)")

		ctxOS.save()
		ctxOS.globalCompositeOperation = "source-over"
		ctxOS.globalAlpha = 1
		ctxOS.fillStyle = grad
		ctxOS.fill(path)
		ctxOS.restore()
	}

	draw(ctx) {
		// All rendering delegated to Circle and RenderTarget2D components
	}

	static triggerBeam(spawnPos, {
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
}