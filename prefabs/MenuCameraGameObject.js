class MenuCameraGameObject extends GameObject {
    constructor() {
        super("MenuCamera")
        this.addComponent(new Camera2D({ 
            aspect: 16/9, 
            viewWidth: 1600, 
            viewHeight: 900,
            zoom: 1 
        }))
    }
}
