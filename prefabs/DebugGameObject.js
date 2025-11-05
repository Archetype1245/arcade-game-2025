class DebugGameObject extends GameObject {
    constructor() {
        super("DebugGameObject")
        this.addComponent(new DebugController())
    }
}