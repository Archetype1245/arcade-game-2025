class BackgroundDotController extends Component {
    constructor() {
        super()
        this.velocity = Vector2.zero
        this.connectionCount = 0
        this.smoothedBrightness = 0
        this.config = { ...DOT_NETWORK_CONFIG }
        this.networkController = null
        
        this._dotCircle = null
        this._glowCircle = null
        
        // Cache for computed color values to avoid string allocation every frame
        this._lastR = 0
        this._lastG = 0
        this._lastB = 0
        this._lastAlpha = 0
        this._lastGlowAlpha = 0
        this._lastGlowRadius = 0
    }

    start() {
        // Create glow circle (drawn first, behind the dot)
        this._glowCircle = this.gameObject.addComponent(new Circle({
            radius: this.config.GLOW_BASE_RADIUS,
            fillStyle: (ctx, radius) => this._createGlowGradient(ctx, radius),
            fill: true,
            alpha: 1,
            hidden: true,
        }))
        
        // Create main dot circle
        this._dotCircle = this.gameObject.addComponent(new Circle({
            radius: this.config.DOT_RADIUS,
            fillStyle: this._getDotColor(),
            fill: true,
            alpha: 1,
            hidden: true,
        }))
    }

    update(dt) {
        const p = this.transform.position
        const padding = this.config.SCREEN_PADDING
        
        // Get design-space bounds from network controller
        const designWidth = this.networkController.designWidth
        const designHeight = this.networkController.designHeight

        p.x += this.velocity.x * dt
        p.y += this.velocity.y * dt

        // Dots bounce off design-space edges
        if (p.x < -padding) {
            p.x = -padding
            this.velocity.x *= -1
        } else if (p.x > designWidth + padding) {
            p.x = designWidth + padding
            this.velocity.x *= -1
        }

        if (p.y < -padding) {
            p.y = -padding
            this.velocity.y *= -1
        } else if (p.y > designHeight + padding) {
            p.y = designHeight + padding
            this.velocity.y *= -1
        }
        this.transform.position = p

        // Smooth brightness transitions
        const targetBrightness = Math.min(this.connectionCount / this.config.MAX_CONNECTIONS, 1)
        this.smoothedBrightness += (targetBrightness - this.smoothedBrightness) * this.config.BRIGHTNESS_SMOOTHING
        
        // Update Circle components with computed values
        this._updateCircles()
    }
    
    _updateCircles() {
        const p = this.transform.position
        const alphaFactor = this.networkController.calcAlphaFactor(p.x, p.y)
        const alpha = this.config.MAX_DOT_ALPHA * alphaFactor * (0.5 + 0.5 * this.smoothedBrightness)
        
        // Compute brightness-adjusted color
        const brightness = 1 + this.smoothedBrightness * 0.5
        const r = Math.min(255, Math.floor(this.config.BASE_DOT_COLOR.r * brightness))
        const g = Math.min(255, Math.floor(this.config.BASE_DOT_COLOR.g * brightness))
        const b = Math.min(255, Math.floor(this.config.BASE_DOT_COLOR.b * brightness))
        
        // Check if dot should be visible
        const dotVisible = alpha > 0.01
        
        // Update dot circle
        if (this._dotCircle) {
            this._dotCircle.hidden = !dotVisible
            
            if (dotVisible) {
                // Only update fillStyle if color changed
                if (r !== this._lastR || g !== this._lastG || b !== this._lastB || alpha !== this._lastAlpha) {
                    this._dotCircle.fillStyle = `rgba(${r},${g},${b},${alpha})`
                    this._lastR = r
                    this._lastG = g
                    this._lastB = b
                    this._lastAlpha = alpha
                }
            }
        }
        
        // Update glow circle
        const glowVisible = dotVisible && this.smoothedBrightness > 0.01
        
        if (this._glowCircle) {
            this._glowCircle.hidden = !glowVisible
            
            if (glowVisible) {
                const glowRadius = this.config.GLOW_BASE_RADIUS +
                    (this.config.GLOW_MAX_RADIUS - this.config.GLOW_BASE_RADIUS) * this.smoothedBrightness
                const glowAlpha = this.config.GLOW_MAX_ALPHA * this.smoothedBrightness * alphaFactor
                
                // Only update if glow parameters changed significantly
                if (Math.abs(glowRadius - this._lastGlowRadius) > 0.1 || 
                    Math.abs(glowAlpha - this._lastGlowAlpha) > 0.005 ||
                    r !== this._lastR || g !== this._lastG || b !== this._lastB) {
                    
                    this._glowCircle.radius = glowRadius
                    this._lastGlowRadius = glowRadius
                    this._lastGlowAlpha = glowAlpha
                    
                    // Store current color values for gradient creation
                    this._glowR = r
                    this._glowG = g
                    this._glowB = b
                    this._glowAlphaValue = glowAlpha
                }
            }
        }
    }
    
    /**
     * Creates the radial gradient for the glow effect
     * Called by Circle component's fillStyle function
     */
    _createGlowGradient(ctx, radius) {
        const r = this._glowR ?? this.config.BASE_DOT_COLOR.r
        const g = this._glowG ?? this.config.BASE_DOT_COLOR.g
        const b = this._glowB ?? this.config.BASE_DOT_COLOR.b
        const glowAlpha = this._glowAlphaValue ?? 0
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        gradient.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`)
        gradient.addColorStop(0.2, `rgba(${r},${g},${b},${glowAlpha * 0.5})`)
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
        
        return gradient
    }
    
    /**
     * Returns initial dot color string
     */
    _getDotColor() {
        const c = this.config.BASE_DOT_COLOR
        return `rgba(${c.r},${c.g},${c.b},${this.config.MAX_DOT_ALPHA})`
    }
}