class UIDisplayController extends Component {
    constructor() {
        super()
    }

    // start() {
    //     this.score = this.gameObject.getComponent(Text)
    // }

    update() {
        this.gameObject.getComponent(Text).text = `SCORE: ${GameGlobals.score}`
    }
}
