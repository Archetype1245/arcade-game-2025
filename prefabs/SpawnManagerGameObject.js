class SpawnManagerGameObject extends GameObject {
    constructor() {
        super("SpawnManagerGameObject")
        this.addComponent(new SpawnManager())
    }
}