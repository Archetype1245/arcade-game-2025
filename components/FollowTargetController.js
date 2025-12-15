class FollowTargetController extends Component {
    start() {
        this.scene = SceneManager.getActiveScene()
        this.target = GameObject.getObjectByName("PlayerGameObject").getComponent(PlayerController)
        this.transform.worldPosition = this.target.transform.worldPosition
    }

    lateUpdate() {
        if (!this.target) {
            const p = GameObject.getObjectByName("PlayerGameObject").getComponent(PlayerController)
            if (p) this.target = p
            else return
        }

        this.transform.worldPosition = this.target.transform.worldPosition
    }
}