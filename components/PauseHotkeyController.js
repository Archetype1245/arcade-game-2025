class PauseHotkeyController extends Component {
    start() {
        this.gameFlow = this.gameObject.getComponent(GameFlowController)
    }

    update(dt) {
        if (!this.gameFlow) return
        if (this.gameFlow.state === GameFlowController.states.GAME_OVER) return  // Prevent pausing while Game Over screen is up
        if (Input.keyPressed("Escape")) {
            this.gameFlow.togglePause()
        }
    }
}