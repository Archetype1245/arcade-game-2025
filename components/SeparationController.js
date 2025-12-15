class SeparationController extends Component {
    constructor({
        tag = "enemy",
        subType = null,      

        radius = 20,         
        searchRadius = null, 

        strength = 1.0,      
        maxPush = Infinity,  
        iterations = 1,      
        enabled = true,

        useGameObjectSubtype = true,
    } = {}) {
        super()
        Object.assign(this, {
            tag,
            subType,
            radius,
            searchRadius,
            strength,
            maxPush,
            iterations,
            enabled,
            useGameObjectSubtype
        })

        this._hits = []
    }

    // Run after your movement. If you have lateUpdate, put this there instead.
    lateUpdate(dt) {
        if (!this.enabled) return
        if (!this.gameObject || this.gameObject.markForDelete) return

        const scene = SceneManager.currentScene
        if (!scene || !scene.spatialMap) return


        const subType = (this.useGameObjectSubtype && this.gameObject.subType)
            ? this.gameObject.subType
            : this.subType

        const r = Math.max(0.0001, this.radius)
        const minSep = r * 2
        const minSep2 = minSep * minSep
        const searchR = this.searchRadius ?? minSep

        for (let iter = 0; iter < this.iterations; iter++) {
            scene.spatialMap.searchNeighbors(this.gameObject, this.tag, this._hits, searchR, subType)

            const p = this.transform.positionRef
            let pushX = 0
            let pushY = 0

            for (const other of this._hits) {
                if (!other || other.markForDelete) continue
                if (other === this.gameObject) continue

                const q = other.transform.positionRef
                let dx = p.x - q.x
                let dy = p.y - q.y
                const d2 = dx * dx + dy * dy

                if (d2 <= 0 || d2 >= minSep2) continue

                const d = Math.sqrt(d2)
                const overlap = (minSep - d)

                dx /= d
                dy /= d

                pushX += dx * overlap
                pushY += dy * overlap
            }

            if (!(pushX || pushY)) break

            if (Number.isFinite(this.maxPush)) {
                const m = Math.hypot(pushX, pushY)
                if (m > this.maxPush && m > 0) {
                    const push = this.maxPush / m
                    pushX *= push
                    pushY *= push
                }
            }

            // Modify transform in-place (performance)
            p.x += pushX * this.strength
            p.y += pushY * this.strength

            scene.spatialMap.update(this.gameObject)
        }
    }
}
