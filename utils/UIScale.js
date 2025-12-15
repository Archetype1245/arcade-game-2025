class UIScale {
    static refWidth = 1920
    static minScale = 0.25
    static maxScale = 2

    static get scale() {
        const scene = SceneManager.currentScene
        const cam = scene?.activeCamera

        if (!cam) {
            const s = Engine.canvas.width / UIScale.refWidth
            return MathUtils.clamp(s, UIScale.minScale, UIScale.maxScale)
        }

        const vp = cam.getViewportRect()

        // Scale relative to the viewport width
        const s = vp.width / UIScale.refWidth
        return MathUtils.clamp(s, UIScale.minScale, UIScale.maxScale)
    }
}

