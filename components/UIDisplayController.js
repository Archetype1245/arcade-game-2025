class UIDisplayController extends Component {
    constructor() {
        super()
    }

    start() {
        Events.addEventListener("EnemyDeath", this)
    }

    update() {
        this.gameObject.getComponent(Text).text = `SCORE: ${GameGlobals.score}`
    }

    handleEvent(signal, event) {
        if (signal === "EnemyDeath") {
            const enemyDef = event.enemyDef
            if (enemyDef && enemyDef.scoreValue) {
                GameGlobals.score += enemyDef.scoreValue
            }
        }
    }
}
