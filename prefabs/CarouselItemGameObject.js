class CarouselItemGameObject extends GameObject {
    constructor(text, index) {
        super("CarouselItem_" + index)
        this.menuText = text
        
        this.cardWidth = 500
        this.cardHeight = 400
        this.headerFraction = 0.25
        this.headerHeight = this.cardHeight * this.headerFraction
        this.bodyHeight = this.cardHeight - this.headerHeight
        
        this.cardHeader = null
        this.cardBody = null
        this.cardText = null

        this.setupChildren(SceneManager.currentScene)
    }
    
    setupChildren(scene) {
        this.cardHeader = GameObject.instantiate(new CardHeaderGameObject(this.cardWidth, this.headerHeight), {
            scene: scene,
            layer: "carouselMid"
        })
        this.cardHeader.transform.setParent(this.transform)
        
        const headerY = -(this.cardHeight / 2) + (this.headerHeight / 2)
        this.cardHeader.transform.position = new Vector2(0, headerY)
        
        this.cardBody = GameObject.instantiate(new CardBodyGameObject(this.cardWidth, this.bodyHeight), {
            scene: scene,
            layer: "carouselMid"
        })
        this.cardBody.transform.setParent(this.transform)
        const bodyY = (this.cardHeight / 2) - (this.bodyHeight / 2)
        this.cardBody.transform.position = new Vector2(0, bodyY)
        

        this.cardText = GameObject.instantiate(new CardTextGameObject(this.menuText), {
            scene: scene,
            layer: "carouselMid"
        })
        this.cardText.transform.setParent(this.cardHeader.transform)
        this.cardText.transform.position = Vector2.zero
    }
}
