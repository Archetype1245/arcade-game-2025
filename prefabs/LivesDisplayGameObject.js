class LivesDisplayGameObject extends GameObject {
    constructor(player, scene) {
        super("LivesDisplayGameObject")

        this.livesText = this.addComponent(new Text(), {
            text: `LIVES: ${player?._lives ?? 3}`,
            font: "bold 36px Arial, sans-serif",
            textAlign: "right",
            textBaseline: "top",
            fillStyle: "rgba(200, 240, 255, 1)",
            glow: true,
            glowConfig: {
                color: "rgba(100, 200, 255, 0.8)",
                blur: 20,
                offsetX: 0,
                offsetY: 0,
                alpha: 1
            },
            outline: true,
            outlineConfig: {
                color: "rgba(100, 200, 255, 0.8)",
                width: 2,
                lineJoin: "round",
                miterLimit: 2,
                alpha: 1
            }
        })

        const shipIconGO = GameObject.instantiate(new GameObject("LivesShipIcon"), {
                scene: scene,
                layer: "ui"
            }
        )
        shipIconGO.transform.setParent(this.transform)
        shipIconGO.transform.rotation = -Math.PI / 2

        const iconScale = 6
        const iconOffsetX = 40
        const iconOffsetY = 15

        shipIconGO.transform.setScale(iconScale)
        shipIconGO.transform.position = new Vector2(iconOffsetX, iconOffsetY)

        shipIconGO.addComponent(new Polygon(), {
            points: Config.Shapes.ship.points,
            fillStyle: "rgba(200, 240, 255, 1)",
            strokeStyle: "rgba(100, 200, 255, 0.9)",
        })

        this.addComponent(new LivesDisplayController(this.livesText, player))
    }
}
