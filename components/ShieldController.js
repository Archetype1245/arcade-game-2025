class ShieldController extends Component {
    constructor({
        duration = 3.0,
        pulseStart = 2.0,
        radius = 30,
        thickness = 2,
        baseAlpha = 0.25,
        pulseAlphaMin = 0.08,
        pulseAlphaMax = 0.35,
        pulseRate = 5.0,

        color = { r: 255, g: 255, b: 255, a: 1 }

    } = {}) {
        super()

        this.duration = duration
        this.pulseStart = pulseStart
        this.radius = radius
        this.thickness = thickness
        this.baseAlpha = baseAlpha
        this.pulseAlphaMin = pulseAlphaMin
        this.pulseAlphaMax = pulseAlphaMax
        this.pulseRate = pulseRate

        this.color = color

        this._elapsed = 0
        this._circle = null
    }

    start() {
        this._circle = this.gameObject.addComponent(new Circle({
            radius: this.radius,
            fillStyle: (ctx, radius) => this._createGradient(ctx, radius),
            alpha: this.baseAlpha,
            shadowColor: `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`,
            shadowBlur: 10,
            strokeStyle: `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a * 0.5})`,
            lineWidth: this.thickness,
        }))
    }

    update(dt) {
        this._elapsed += dt
        const remaining = this.duration - this._elapsed

        if (remaining <= 0) {
            this.gameObject.destroy()
            return
        }

        // Pulse when remaining < pulseStart
        this.alpha = this.baseAlpha

        if (remaining < this.pulseStart) {
            const timeInPulse = this.pulseStart - remaining
            const u = timeInPulse * this.pulseRate * MathUtils.TAU
            const s = 0.5 + 0.5 * Math.sin(u)
            this.alpha = this.pulseAlphaMin + (this.pulseAlphaMax - this.pulseAlphaMin) * s
            // const u = Time.time * this.pulseRate * MathUtils.TAU
            // const s = 0.5 + 0.5 * Math.sin(u)
            // this.alpha = this.pulseAlphaMin + (this.pulseAlphaMax - this.pulseAlphaMin) * s
        }

        // Fade in + fade out
        const t = this._elapsed / this.duration
        const fadeIn = MathUtils.clamp01(t / 0.15)
        const fadeOut = MathUtils.clamp01((1 - t) / 0.15)

        this.alpha *= Math.min(fadeIn, fadeOut)

        if (this._circle) this._circle.alpha = this.alpha
    }

    _createGradient(ctx, radius) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0.1)`)
        gradient.addColorStop(0.6, `rgba(${this.color.r},${this.color.g},${this.color.b},0.5)`)
        gradient.addColorStop(0.9, `rgba(${this.color.r},${this.color.g},${this.color.b},0.8)`)
        gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0.2)`)

        return gradient
    }
}
