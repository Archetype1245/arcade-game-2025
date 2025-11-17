class BackgroundDotController extends Component {
    constructor() {
        super()
        this.velocity = Vector2.zero
        this.connectionCount = 0
        this.smoothedBrightness = 0
        this.config = { ...DOT_NETWORK_CONFIG }
    }

    update(dt) {
        const p = this.transform.position
        const padding = this.config.SCREEN_PADDING
        const canvas = Engine.canvas

        p.x += this.velocity.x * dt
        p.y += this.velocity.y * dt

        // Dots bounce off edges (due to padding, this is not visible on-screen)
        if (p.x < -padding) {
            p.x = -padding
            this.velocity.x *= -1
        } else if (p.x > canvas.width + padding) {
            p.x = canvas.width + padding
            this.velocity.x *= -1
        }

        if (p.y < -padding) {
            p.y = -padding
            this.velocity.y *= -1
        } else if (p.y > canvas.height + padding) {
            p.y = canvas.height + padding
            this.velocity.y *= -1
        }
        this.transform.position = p

        const targetBrightness = Math.min(this.connectionCount / this.config.MAX_CONNECTIONS, 1)
        // Interpolate brightness so the change isn't jarring (or as noticeable)
        this.smoothedBrightness += (targetBrightness - this.smoothedBrightness) * this.config.BRIGHTNESS_SMOOTHING
    }

    draw(ctx) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)   // TODO: update Scene's draw method to better handle multiple screen-space layers

        const p = this.transform.position

        const controller = GameObject.getObjectByName("DotNetworkGameObject").getComponent(DotNetworkController)
        const alphaFactor = controller.calcAlphaFactor(p.x, p.y)
        const alpha = this.config.MAX_DOT_ALPHA * alphaFactor * (0.5 + 0.5 * this.smoothedBrightness)

        if (alpha > 0.01) {
            const brightness = 1 + this.smoothedBrightness * 0.5
            const r = Math.min(255, this.config.BASE_DOT_COLOR.r * brightness)
            const g = Math.min(255, this.config.BASE_DOT_COLOR.g * brightness)
            const b = Math.min(255, this.config.BASE_DOT_COLOR.b * brightness)

            if (this.smoothedBrightness > 0.01) {
                const glowRadius = this.config.GLOW_BASE_RADIUS +
                    (this.config.GLOW_MAX_RADIUS - this.config.GLOW_BASE_RADIUS) * this.smoothedBrightness
                const glowAlpha = this.config.GLOW_MAX_ALPHA * this.smoothedBrightness * alphaFactor

                // Radial gradient for glow effect
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius)
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha})`)
                gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${glowAlpha * 0.5})`)
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(p.x, p.y, glowRadius, 0, 2*Math.PI)
                ctx.fill()
            }


            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, this.config.DOT_RADIUS, 0, 2 * Math.PI)
            ctx.fill()
        }
        ctx.restore()
    }
}