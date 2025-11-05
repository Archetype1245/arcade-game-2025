class CardVisualController extends Component {
    constructor(colors) {
        super()
        this.opacity = 1
        this.depth = 0
        this.time = 0

        this.r = colors.r
        this.g = colors.g
        this.b = colors.b
    }

    start() {
        this.poly = this.gameObject.getComponent(Polygon)
    }

    update() {
        if (this.poly) {
            // this.poly.hidden = true
            
            // Slightly change each color based on their depth
            const r = this.r + this.depth * 0.10
            const g = this.g - this.depth * 0.05
            const b = this.b + this.depth * 0.05
            
            this.poly.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`
        }
    }
}
