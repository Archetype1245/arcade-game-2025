class GameHUDGameObject extends GameObject {
    constructor(scene, player) {
        super("GameHUDGameObject")

        const scoreGO = GameObject.instantiate(new ScoreDisplayGameObject(), { scene: scene, layer: "ui" })
        scoreGO.transform.setParent(this.transform)
        scoreGO.transform.position = new Vector2(50, 50)

        const livesGO = GameObject.instantiate(new LivesDisplayGameObject(player, scene), { scene: scene, layer: "ui" })
        livesGO.transform.setParent(this.transform)
        livesGO.transform.position = Vector2.zero
    }
}