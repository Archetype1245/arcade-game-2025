class GameFlowController extends Component {
    start() {
        this.scene = SceneManager.currentScene
        this.state = GameFlowController.states.RUNNING
        this._pausedFrom = null
        this._gameOverMenuGO = null
        this._pauseMenuGO = null
        this._savedScaled = null

        Events.addEventListener("PlayerDeath", (data) => this._onPlayerDeath(data))
        Events.addEventListener("GameOver", (data) => this._onGameOver(data))
    }

    _onPlayerDeath(data) {
        this.state = GameFlowController.states.DEATH_FREEZE
        this._applyScales({ world: 0 })

        // Timer tracks remaining death freeze duration - pauses appropriately when game is paused
        Time.afterPausable(data.shieldTimer, () => {

            if (this.state === GameFlowController.states.DEATH_FREEZE) {
                this.state = GameFlowController.states.RUNNING
                this._applyScales({ world: 1 })
                data.enemy.destroy()
            }
        })
    }

    _onGameOver(data) {
        this.state = GameFlowController.states.GAME_OVER

        this._savedScales = { ...Time.scale }
        Time.paused = true
        Time.scale.world = 0
        Time.scale.fx = 0
        Time.scale.background = 0
        Time.scale.ui = 1

        this._showGameOverMenu()
    }

    _showGameOverMenu() {
        if (this._gameOverMenuGO && !this._gameOverMenuGO.markForDelete) return

        const uiRoot = GameObject.getObjectByName("UIRootGameObject")
        const vp = this.scene.activeCamera.getViewportRect()
        const scale = UIScale.scale || 1

        this._gameOverMenuGO = GameObject.instantiate(new GameObject("GameOverMenuGO"), {
            scene: this.scene,
            layer: "ui",
        })
        this._gameOverMenuGO.transform.setParent(uiRoot.transform, false)
        this._gameOverMenuGO.transform.position = new Vector2((vp.width * 0.5) / scale, (vp.height * 0.5) / scale)

        this._gameOverMenuGO.addComponent(new GameOverMenuController(this))
    }

    _hideGameOverMenu() {
        if (this._gameOverMenuGO) this._gameOverMenuGO.destroy()
        this._gameOverMenuGO = null
    }

    playAgain() {
        this._resetTimeToDefaults()
        this._savedScales = null

        this._hideGameOverMenu()
        this.state = GameFlowController.states.RUNNING

        this._restartCurrentScene()
    }

    _restartCurrentScene() {
        this._resetTimeToDefaults()
        SceneManager.loadScene(new GameScene())
    }


    togglePause() {
        if (this.state === GameFlowController.states.PAUSED) {
            this.resume()
        } else {
            this.pause()
        }
    }

    pause() {
        if (this.state === GameFlowController.states.PAUSED) return

        this._pausedFrom = this.state
        this.state = GameFlowController.states.PAUSED

        // Save existing Time scales
        this._savedScales = { ...Time.scale }

        Time.paused = true
        Time.scale.world = 0
        Time.scale.fx = 0
        Time.scale.background = 0
        Time.scale.ui = 1

        this._showPauseMenu()
    }

    resume() {
        if (this.state !== GameFlowController.states.PAUSED) return

        // Unpause and revert to pre-existing Time scales
        Time.paused = false
        Object.assign(Time.scale, this._savedScales ?? {})
        this._savedScales = null

        this._hidePauseMenu()

        this.state = this._pausedFrom ?? GameFlowController.states.RUNNING
        this._pausedFrom = null

        if (this._pendingDeathFreezeEnd) {
            const fn = this._pendingDeathFreezeEnd
            this._pendingDeathFreezeEnd = null
            fn()
        }
    }

    _applyScales({ world = 1, fx = 1, background = 1, ui = 1, unscaled = 1 } = {}) {
        Time.scale.world = world
        Time.scale.fx = fx
        Time.scale.background = background
        Time.scale.ui = ui
        Time.scale.unscaled = unscaled
    }

    returnToMainMenu() {
        this._resetTimeToDefaults()
        this._applyScales()
        SceneManager.loadScene(new MainMenuScene())
    }

    _showPauseMenu() {
        if (this._pauseMenuGO && !this._pauseMenuGO.markForDelete) return

        const uiRoot = GameObject.getObjectByName("UIRootGameObject")
        const vp = this.scene.activeCamera.getViewportRect()
        const scale = UIScale.scale

        this._pauseMenuGO = GameObject.instantiate(new GameObject("PauseMenuGO"), {
            scene: this.scene,
            layer: "ui",
        })
        this._pauseMenuGO.transform.setParent(uiRoot.transform, false)
        this._pauseMenuGO.transform.position = new Vector2((vp.width * 0.5) / scale, (vp.height * 0.5) / scale)
        this._pauseMenuGO.addComponent(new PauseMenuController(this))
    }

    _hidePauseMenu() {
        if (this._pauseMenuGO) this._pauseMenuGO.destroy()
        this._pauseMenuGO = null
    }

    _resetTimeToDefaults() {
        Time.paused = false
        Time.scale.world = 1
        Time.scale.fx = 1
        Time.scale.background = 1
        Time.scale.ui = 1
        Time.scale.unscaled = 1
    }


    static states = {
        RUNNING: 0,
        DEATH_FREEZE: 1,
        PAUSED: 2,
        GAME_OVER: 3
    }
}
