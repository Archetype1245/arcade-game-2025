class BackgroundDotGameObject extends GameObject {
    constructor(id) {
        super(`BackgroundDot_${id}`)
        this.tag = "bgDot"
        this.id = id
        this.addComponent(new BackgroundDotController())
    }
}