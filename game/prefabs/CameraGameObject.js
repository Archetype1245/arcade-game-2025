class CameraGameObject extends GameObject {
    constructor() {
        super("CameraGameObject")
        
        const maxW = (Config.playable.w) * Config.camera.coverage
        const maxH = (Config.playable.h) * Config.camera.coverage
        const viewWidth = Math.min(maxW, maxH * Config.camera.aspect)
        const viewHeight = viewWidth / Config.camera.aspect

        this.addComponent(new Camera2D({
            aspect: Config.camera.aspect,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
            zoom: Config.camera.zoom
        }))
        this.addComponent(new FollowTargetController())
    }
}