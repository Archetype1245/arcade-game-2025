class LaserGameObject extends GameObject {
    constructor(a) {
        super("LaserGameObject")
        this.type = Config.objectType.bullet
        this.addComponent(new LaserController(a))
        this.swept = this.addComponent(new SweptCircle(), { radius: 8 })
    }
}