class ProjectorBeamController extends Component {
    constructor() {
        super()
        this.beamWidthBase = 50
        this.beamWidthTop = 1100
        this.beamHeight = 800

        this.points = [new Vector2(-this.beamWidthBase / 2, 0), new Vector2(this.beamWidthBase / 2, 0),
        new Vector2(this.beamWidthTop / 2, -this.beamHeight), new Vector2(-this.beamWidthTop / 2, -this.beamHeight)]

        this.opacity = 0.6
        this.time = 0
    }

    start() {
        this.gameObject.addComponent(new Polygon(), {
            points: this.points,
            operation: "lighter",
            filter: "blur(10px)",
            fillStyle: (ctx) => this.createGradient(ctx)
        })
    }

    createGradient(ctx) {
        const gradVertical = ctx.createLinearGradient(0, 0, 0, -this.beamHeight)
        gradVertical.addColorStop(0.0, `rgba(255, 161, 30, ${this.opacity})`)
        gradVertical.addColorStop(0.3, `rgba(255, 161, 30, ${this.opacity * 0.4})`)
        gradVertical.addColorStop(1.0, `rgba(160, 240, 255, 0)`)
        return gradVertical
    }
}
