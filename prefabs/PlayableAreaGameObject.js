class PlayableAreaGameObject extends GameObject {
    constructor() {
        super("PlayableAreaGameObject")

        const w = Config.Playable.w
        const h = Config.Playable.h
        const cx = w / 2
        const cy = h / 2
        this.transform.position = { x: cx, y: cy }

        const points =
            [new Vector2(-w / 2, -h / 2),
            new Vector2(w / 2, -h / 2),
            new Vector2(w / 2, h / 2),
            new Vector2(-w / 2, h / 2)]

        this.addComponent(new Polygon(), {
            points: points,
            fill: true,
            fillStyle: Config.Colors.arenaBackground,
            lineWidth: 6,
            strokeStyle: "black"
        })
    }
}