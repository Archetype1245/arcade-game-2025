class ProjectorBeamController extends Component {
    constructor() {
        super()
        this.beamWidthBase = 50
        this.beamWidthTop = 1100
        this.beamHeight = 800

        this.points = [new Vector2(-this.beamWidthBase / 2, 0), new Vector2(this.beamWidthBase / 2, 0),
        new Vector2(this.beamWidthTop / 2, -this.beamHeight), new Vector2(-this.beamWidthTop / 2, -this.beamHeight)]

        this.opacity = 0.7
        this.time = 0
    }

    update() {
        this.opacity = 0.7 + Math.sin(Time.time) * 0.05
    }

    draw(ctx) {
        const p = new Path2D()
        p.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i < this.points.length; i++) {
            p.lineTo(this.points[i].x, this.points[i].y)
        }
        p.closePath()

        const gradVertical = ctx.createLinearGradient(0, 0, 0, -this.beamHeight)
        gradVertical.addColorStop(0.0, `rgba(255, 161, 30, ${this.opacity})`)
        gradVertical.addColorStop(0.3, `rgba(255, 161, 30, ${this.opacity * 0.4})`)
        gradVertical.addColorStop(1.0, `rgba(160, 240, 255, 0)`)

        const gradHorizontal = ctx.createLinearGradient(-this.beamWidthTop / 2, 0, this.beamWidthTop / 2, 0)
        gradHorizontal.addColorStop(0.0, "rgba(0, 0, 0, 0)")
        gradHorizontal.addColorStop(0.5, "rgba(255, 255, 255, 1)")
        gradHorizontal.addColorStop(1.0, "rgba(0, 0, 0, 0)")

        ctx.save()
        ctx.globalCompositeOperation = "lighter"

        ctx.filter = "blur(10px)"
        ctx.globalAlpha = this.opacity * 0.8
        ctx.fillStyle = gradVertical
        ctx.fill(p)
        ctx.restore()
    }


}
