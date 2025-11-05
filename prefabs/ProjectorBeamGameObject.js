class ProjectorBeamGameObject extends GameObject {
    constructor() {
        super("ProjectorBeamGameObject")
        this.addComponent(new ProjectorBeamController())
    }
}
