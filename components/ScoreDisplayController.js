class ScoreDisplayController extends Component {
    constructor(display) {
        super()
        this.scoreDisplay = display
        this.scoreMult = 1

        this.scoreStartLife = 0
        this.scoreTotalThisLife = 0
    }

    start() {
        Events.addEventListener("EnemyKilled", (data) => this._onEnemyKilled(data))
        Events.addEventListener("PlayerDeath", (data) => this._onPlayerDeath(data))
    }

    update() {
        this.scoreDisplay.text = `SCORE: ${GameGlobals.score}`
    }

    onDestroy() {
        Events.removeEventListener("EnemyKilled", this)
    }

    _onEnemyKilled(data) {
        const enemyDef = data.enemyDef
        if (enemyDef && enemyDef.scoreValue) {
            const scoreInc = enemyDef.scoreValue * this.scoreMult
            GameGlobals.score += scoreInc
            this.scoreTotalThisLife += scoreInc

            this._updateMultiplier()
        }
    }

    _onPlayerDeath(data) {
        this.scoreMult = 1
        this.scoreStartLife = GameGlobals.score
    }

    _updateMultiplier() {
        const thresholds = ScoreDisplayController.MultiplierThresholds

        for (let i = thresholds.length - 1; i >= 0; i--) {
            const [threshold, mult] = thresholds[i]

            if (this.scoreTotalThisLife >= threshold) {
                this.scoreMult = mult

                if (i < thresholds.length - 1) {
                    this.nextThreshold = thresholds[i + 1][0]
                } else {
                    this.nextThreshold = Infinity
                }
                return
            }
        }
    }

    static MultiplierThresholds = [
        [0, 1.0],
        [1000, 2.0],
        [5000, 3.0],
        [18000, 5.0],
        [100000, 7.5],
        [250000, 10.0],
        [1000000, 15.0],
    ]
}
