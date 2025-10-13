class DebugController extends Component {
    start() {
        this.scene = Engine.currentScene
        this.cam = GameObject.getObjectByName("CameraGameObject").getComponent(Camera2D)
    }

    update() {
        if (Input.keyHeld("ShiftLeft")) {
            let enemyType = null
            if (Input.keyPressed("Digit1")) {
                enemyType = Config.enemyTypes.purple
            } else if (Input.keyPressed("Digit2")) {
                enemyType = Config.enemyTypes.blue
            } else if (Input.keyPressed("Digit3")) {
                enemyType = Config.enemyTypes.green
            } else if (Input.keyPressed("Digit4")) {
                enemyType = Config.enemyTypes.pink
            }

            if (enemyType) {
                GameObject.instantiate(new EnemyGameObject(enemyType), {
                    scene: this.scene,
                    layer: Config.layers.enemies,
                    position: this.cam.screenPointToWorld(new Vector2(Input.mouseX, Input.mouseY))
                })
            }
        }
    }

    draw(ctx) {

    }
}