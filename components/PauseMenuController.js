// TODO: Refactor this and GameOverMenuController into a single customizable component, as they are basically identical
class PauseMenuController extends Component {
    constructor(gameFlow) {
        super()
        this.gameFlow = gameFlow
        this.scene = SceneManager.currentScene

        this.items = ["Resume", "Main Menu"]
        this.selected = 0

        this.title = "PAUSED"
        this.titleFont = "64px sans-serif"
        this.itemFont = "48px sans-serif"
        this.yTitle = -150
        this.y0 = -40
        this.dy = 90
        this.centerX = 0

        this._itemGOs = []
        this._itemTexts = []
        this._leftSel = null
        this._rightSel = null
    }

    start() {
        // Backdrop
        const backdropGO = GameObject.instantiate(new GameObject("PauseBackdropGO"), {
            scene: this.scene,
            layer: "ui",
            position: Vector2.zero,
        })
        backdropGO.transform.setParent(this.transform, false)


        this._backdrop = backdropGO.addComponent(new PauseBackdropController({
            dimAlpha: 0.15,
            stripHeight: 600,
            color: { r: 0, g: 35, b: 70 }
        }))

        // Title
        const titleGO = GameObject.instantiate(new GameObject("PauseTitleGO"), {
            scene: this.scene,
            layer: "ui",
            position: new Vector2(this.centerX, this.yTitle),
        })
        titleGO.transform.setParent(this.transform, false)
        titleGO.addComponent(new Text(), {
            text: this.title,
            font: this.titleFont,
            align: "center",
            baseline: "middle",
            fillStyle: "rgba(120,255,255,0.9)",
        })

        // Items
        for (let i = 0; i < this.items.length; i++) {
            const go = GameObject.instantiate(new GameObject(`PauseItem${i}GO`), {
                scene: this.scene,
                layer: "ui",
                position: new Vector2(this.centerX, this.y0 + i * this.dy),
            })
            go.transform.setParent(this.transform, false)

            const t = go.addComponent(new Text(), {
                text: this.items[i],
                font: this.itemFont,
                align: "center",
                baseline: "middle",
                fillStyle: "rgba(120,255,255,0.65)",
            })

            this._itemGOs.push(go)
            this._itemTexts.push(t)
        }

        // Selector lines
        this._leftSel = this._makeSelectorLine("left")
        this._rightSel = this._makeSelectorLine("right")

        // Brighten selected menu item
        this._applySelectionVisuals()
        // Update selector line positions
        this._updateSelectorTargets()
    }

    update(dt) {
        if (Input.keyPressed("ArrowUp") || Input.keyPressed("KeyW")) {
            this.selected = Math.max(0, this.selected - 1)
            this._applySelectionVisuals()
            this._updateSelectorTargets()
        }

        if (Input.keyPressed("ArrowDown") || Input.keyPressed("KeyS")) {
            this.selected = Math.min(this.items.length - 1, this.selected + 1)
            this._applySelectionVisuals()
            this._updateSelectorTargets()
        }

        if (Input.keyPressed("Enter") || Input.keyPressed("NumpadEnter") || Input.keyPressed("Space")) {
            this._activate()
        }

        this._positionMenuAtViewportCenter()
    }

    _makeSelectorLine(side) {
        const go = GameObject.instantiate(new GameObject(`PauseSelector_${side}`), {
            scene: this.scene,
            layer: "ui",
            position: new Vector2(this.centerX, this.y0),
        })
        go.transform.setParent(this.transform, false)

        return go.addComponent(new SelectorLineController(), {
            side,
            lineWidth: 3,
            pad: 18,
            length: 140,
            alpha: 0.95,
            color: { r: 140, g: 255, b: 255 },
            smooth: 25
        })
    }

    _applySelectionVisuals() {
        for (let i = 0; i < this._itemTexts.length; i++) {
            this._itemTexts[i].fillStyle = (i === this.selected)
                ? "rgba(140,255,255,1.0)"
                : "rgba(120,255,255,0.60)"
        }
    }

    _updateSelectorTargets() {
        const y = this.y0 + this.selected * this.dy
        const text = this.items[this.selected]

        this._leftSel.setTarget({
            y,
            text,
            font: this.itemFont,
            centerX: this.centerX
        })

        this._rightSel.setTarget({
            y,
            text,
            font: this.itemFont,
            centerX: this.centerX
        })
    }

    _activate() {
        if (this.selected === 0) this.gameFlow.togglePause()
        else this.gameFlow.returnToMainMenu()
    }

    _positionMenuAtViewportCenter() {
        const cam = this.scene.activeCamera
        if (!cam) return

        const vp = cam.getViewportRect()

        const scale = UIScale.scale || 1
        const cx = (vp.width * 0.5) / scale
        const cy = (vp.height * 0.5) / scale

        this.transform.position = new Vector2(cx, cy)
    }
}
