class CarouselController extends Component {
    constructor() {
        super()
        this.menuItems = [
            { text: "Game Mode 1",  action: "startGame" },
            { text: "Game Mode 2",  action: "gameMode2" },
            { text: "Settings",     action: "settings" },
            { text: "Leaderboards", action: "leaderboards" },
            { text: "Quit Game",    action: "quit" }
        ]
        this.currentIndex = 0
        this.carouselObjects = []
        this.rotationCooldown = 0
        this.rotationCooldownTime = 0.2
        this.isRotating = false
        this.rotationProgress = 0
        this.rotationDuration = 0.3
        this.targetIndex = 0
        this.rotationDirection = 0
        this.radiusX = 500
        this.radiusZ = 250
        this.baseY = -25
    }

    start() {
        this.scene = SceneManager.currentScene

        // Create all carousel items as children of this gameobject
        for (let i = 0; i < this.menuItems.length; i++) {
            const menuItem = GameObject.instantiate(new CarouselItemGameObject(this.menuItems[i].text, i), {
                scene: this.scene,
                layer: "carouselMid"
            })

            menuItem.transform.setParent(this.transform)
            this.carouselObjects.push(menuItem)
        }
        this.updateCarouselPositions(0)     // Give them correct initial positions/colors/etc.
    }

    update() {
        if (this.rotationCooldown > 0) this.rotationCooldown -= Time.deltaTime   // TODO: look into making this a Transition??
        // Handle rotation animation
        if (this.isRotating) {
            this.rotationProgress += Time.deltaTime / this.rotationDuration
            if (this.rotationProgress >= 1) {
                this.rotationProgress = 1
                this.isRotating = false
                this.currentIndex = this.targetIndex

                this.updateCarouselPositions(0)
            } else {
                this.updateCarouselPositions(this.rotationProgress)
            }
        }

        // Handle input when not rotating
        if (!this.isRotating && this.rotationCooldown <= 0) {
            let direction = 0
            if (Input.keyPressed("KeyA") || Input.keyPressed("ArrowLeft")) {
                direction = -1
            } else if (Input.keyPressed("KeyD") || Input.keyPressed("ArrowRight")) {
                direction = 1
            }

            if (direction !== 0) {
                this.rotationDirection = direction
                this.targetIndex = (this.currentIndex + direction + this.menuItems.length) % this.menuItems.length
                this.isRotating = true
                this.rotationProgress = 0
                this.rotationCooldown = this.rotationCooldownTime
            }

            // Either "enter" key selects current card      TODO: Maybe implement mouse detection and click logic??
            if (Input.keyPressed("Enter") || Input.keyPressed("NumpadEnter")) {
                this.selectCurrentItem()
            }
        }
    }

    updateCarouselPositions(t) {
        const numItems = this.menuItems.length
        const angleStep = (Math.PI * 2) / numItems   // Evenly space the cards - handles variable number of cards, though they all face forward so too many will result in overlap
        const currentAngleOffset = -this.rotationDirection * angleStep * MathUtils.easeInOutCubic(t)

        for (let i = 0; i < numItems; i++) {
            const carouselItem = this.carouselObjects[i]
            const itemOffset = (i - this.currentIndex + numItems) % numItems
            const baseAngle = itemOffset * angleStep - Math.PI / 2     // base angle (front card) is -pi/2 (down/towards screen)
            const angle = baseAngle + currentAngleOffset               // other positions are just angle offset increments around the fake 3D ellipse

            // X goes left-right, Z goes away from camera
            const x = Math.cos(angle) * this.radiusX
            const z = Math.sin(angle) * this.radiusZ

            // Front items slightly lower, back items slightly higher (just reinforces the 3D look)
            const yOffset = (z / this.radiusZ) * 80
            const y = this.baseY - yOffset

            // Set local position relative to parent (this carousel GameObject)
            carouselItem.transform.position = new Vector2(x, y)

            // Normalize angle to 0-2PI range for layer determination
            let normalizedAngle = angle % (Math.PI * 2)
            if (normalizedAngle < 0) normalizedAngle += Math.PI * 2

            // Distance from front position
            const frontAngle = -(Math.PI / 2)
            const distFromFront = Math.min(
                Math.abs(normalizedAngle - frontAngle),
                Math.abs(normalizedAngle - frontAngle + Math.PI * 2),
                Math.abs(normalizedAngle - frontAngle - Math.PI * 2)
            )

            // Distance from back position (PI/2)
            const backAngle = Math.PI / 2
            const distFromBack = Math.abs(normalizedAngle - backAngle)

            let layer = "carouselMid"
            let isBackItem = false

            if (distFromFront < angleStep * 0.6) {
                layer = "carouselFront"
            } else if (distFromBack < angleStep * 1.2) {     // Slightly wider "back" section to just keep overlaps minimal (back items have lower alpha)
                layer = "carouselBack"
                isBackItem = true
            }
            
            // Ensure all the card GOs end in the appropriate layer
            if (carouselItem.layer !== layer) {
                this.scene.changeLayer(carouselItem, layer)
                if (carouselItem.cardHeader && carouselItem.cardHeader.layer !== layer) {
                    this.scene.changeLayer(carouselItem.cardHeader, layer)
                }
                if (carouselItem.cardBody && carouselItem.cardBody.layer !== layer) {
                    this.scene.changeLayer(carouselItem.cardBody, layer)
                }
                if (carouselItem.cardText && carouselItem.cardText.layer !== layer) {
                    this.scene.changeLayer(carouselItem.cardText, layer)
                }
            }
            
            const depthScale = 0.4 + (this.radiusZ - z) / (this.radiusZ * 2) * 0.6
            carouselItem.transform.scale = new Vector2(depthScale, depthScale)

            const headerOpacity = isBackItem ? 0.10 : depthScale
            const bodyOpacity = isBackItem ? 0.10 : (depthScale*0.3) + 0.4

            // Update card alpha/opacity values and their depth (depth slightly modifies color)
            const headerController = carouselItem.cardHeader.getComponent(CardVisualController)
            if (headerController) {
                headerController.opacity = headerOpacity
                headerController.depth = z
            }

            const bodyController = carouselItem.cardBody.getComponent(CardVisualController)
            if (bodyController) {
                bodyController.opacity = bodyOpacity
                bodyController.depth = z
            }

            const text = carouselItem.cardText.getComponent(Text)
            if (text) {
                text.hidden = isBackItem    // Hide text if the card is in the "back"
            }
        }
    }

    selectCurrentItem() {
        const currentItem = this.menuItems[this.currentIndex]

        switch (currentItem.action) {
            case "startGame":
                SceneManager.loadScene(new GameScene())
                break
            case "gameMode2":
                console.log("Game Mode 2 not implemented yet")
                break
            case "settings":
                console.log("Settings not implemented yet")
                break
            case "leaderboards":
                console.log("Leaderboards not implemented yet")
                break
            case "quit":
                console.log("Quit not implemented")
                break
        }
    }
    // Useful if I eventually get around to adding an on-start animation that moves the carousel up from the bottom
    moveCarousel(newPosition) {
        this.transform.position = newPosition
    }

    getCarouselPosition() {
        return this.transform.position
    }
}
