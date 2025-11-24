class UIDisplayController extends Component {
    constructor() {
        super()
    }

    update() {
        this.gameObject.getComponent(Text).text = `SCORE: ${GameGlobals.score}`
    }
}
