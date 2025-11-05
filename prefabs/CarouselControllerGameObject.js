class CarouselControllerGameObject extends GameObject {
    constructor() {
        super("CarouselController")
        this.addComponent(new CarouselController())
    }
}
