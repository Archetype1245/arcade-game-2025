class CarouselGameObject extends GameObject {
    constructor() {
        super("CarouselGameObject")
        this.addComponent(new CarouselController())
    }
}
