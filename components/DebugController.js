class DebugController extends Component {
    start() {
        this.scene = SceneManager.currentScene
        this.cam = this.scene.activeCamera
    }

    update() {
        if (Input.keyHeld("ShiftLeft")) {
            let enemyId = null
            if (Input.keyPressed("Digit1")) {
                enemyId = "PurpleEnemy"
            } else if (Input.keyPressed("Digit2")) {
                enemyId = "BlueEnemy"
            } else if (Input.keyPressed("Digit3")) {
                enemyId = "GreenEnemy"
            } else if (Input.keyPressed("Digit4")) {
                enemyId = "PinkEnemy"
            }

            if (enemyId) {
                const enemy = EnemyDefs[enemyId]
                for (let i = 0; i < 1; i++) {
                    this.spawnEnemyDebug(enemy)
                }
            }
        }
    }


    async spawnEnemyDebug(enemy) {
        const pos = this.cam.screenPointToWorld(new Vector2(Input.mouseX, Input.mouseY))
        let enemyGameObject

        switch (enemy.type) {
            case Config.enemyTypes.purple:
                enemyGameObject = new PurpleEnemyGameObject(enemy)
                break
            case Config.enemyTypes.blue:
                enemyGameObject = new BlueEnemyGameObject(enemy)
                break
            case Config.enemyTypes.pink:
                enemyGameObject = new PinkEnemyGameObject(enemy)
                break
            case Config.enemyTypes.green:
                enemyGameObject = new GreenEnemyGameObject(enemy)
                break
            default:
                console.warn("Unknown enemy type in debug:", enemy.type)
                return
        }

        await LightBeam.triggerBeam(pos, {
            color: enemy.beamColor,
            length: Math.hypot(Engine.canvas.width/2, Engine.canvas.height/2)
        })

        GameObject.instantiate(enemyGameObject, {
            scene: SceneManager.currentScene,
            layer: Config.layers.enemies,
            position: pos
        })
    }

    draw(ctx) {

    }
}