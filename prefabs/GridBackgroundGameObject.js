class GridBackgroundGameObject extends GameObject {
    constructor(opts = {}) {
        super("GridBackgroundGameObject");
        this.addComponent(new GridBackgroundController(opts));
    }
}
