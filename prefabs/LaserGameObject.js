class LaserGameObject extends GameObject {
    constructor(a) {
        super("LaserGameObject")
        this.tag = "laser"
        this.addComponent(new LaserController(a))
        this.swept = this.addComponent(new SweptCircle(), { radius: 8 })
    }
}