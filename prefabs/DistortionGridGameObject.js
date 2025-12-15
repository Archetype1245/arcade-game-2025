class DistortionGridGameObject extends GameObject {
    constructor(controllerConfig = {}) {
        super("DistortionGridGameObject")
        this.layer = "grid"
        this.tag = "grid"

        this.gridController = this.addComponent(
            new DistortionGridController(),
            controllerConfig
        )
    }

    applyImpulse(x, y, strength, radius) {
        this.gridController.applyImpulse(x, y, strength, radius)
    }
}