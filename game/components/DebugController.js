class DebugController extends Component {
    start() {
        this.scene = SceneManager.currentScene
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
                for (let i = 0; i < 1; i++) {
                    this.spawnEnemyDebug(enemyType)
                }
            }
        }
    }


    async spawnEnemyDebug(enemyType) {
        const pos = this.cam.screenPointToWorld(new Vector2(Input.mouseX, Input.mouseY))
        const player = GameObject.getObjectByName("PlayerGameObject")
        let color

        switch (enemyType) {
            case Config.enemyTypes.purple:
                color = Config.beamColors.purpleBeam
                break
            case Config.enemyTypes.blue:
                color = Config.beamColors.lightBlueBeam
                break
            case Config.enemyTypes.pink:
                color = Config.beamColors.pinkBeam
                break
            case Config.enemyTypes.green:
                color = Config.beamColors.greenBeam
                break
        }

        await LightBeam.play(pos, {
            color: color,
            duration: 1.2,
            width: 40,
            playerName: "PlayerGameObject",
            length: Math.hypot(Engine.canvas.width, Engine.canvas.height)
        })

        GameObject.instantiate(new EnemyGameObject(enemyType), {
            scene: SceneManager.currentScene,
            layer: Config.layers.enemies,
            position: pos
        })
    }

    draw(ctx) {

    }
}