// class DotNetworkController extends Component {
//     constructor() {
//         super()
//         this.dots = []
//         this.canvas = null
//         this.config = { ...DOT_NETWORK_CONFIG }
//         this._hits = []
//     }

//     start() {
//         this.canvas = document.querySelector("#canv")
//         this._spawnDots()
//     }
    
//     update(dt) {
//         let dotComponent = null
//         // Each frame, reset connection count to 0 and recalculate the value
//         this.dots.forEach(dot => {
//             dotComponent = dot.getComponent(BackgroundDotController)
//             dotComponent.connectionCount = 0
//         })
        
//         // Use spatial map to find and track current connections
//         const spatialMap = SceneManager.currentScene.spatialMap
        
//         this.dots.forEach(dot => {
//             const connections = spatialMap.searchNeighbors(dot, "bgDot", this._hits, this.config.CONNECTION_RADIUS)
            
//             connections.forEach(neighbor => {
//                 const neighborComponent = neighbor.getComponent(BackgroundDotController)
//                 dotComponent.connectionCount++
//                 neighborComponent.connectionCount++
//             })
//         })
//     }
    
//     draw(ctx) {
//         ctx.save()
//         this._drawConnections(ctx)
//         ctx.restore()
//     }
    
//     _spawnDots() {
//         const width = this.canvas.width
//         const height = this.canvas.height
//         const padding = this.config.SCREEN_PADDING

//         for (let i = 0; i < this.config.NUM_DOTS; i++) {
//             // Position the dots across (and slightly beyond) screen
//             const x = Math.random() * (width + padding * 2) - padding
//             const y = Math.random() * (height + padding * 2) - padding

//             const dot = GameObject.instantiate(new BackgroundDotGameObject(i), {
//                 scene: SceneManager.currentScene,
//                 position: new Vector2(x, y),
//                 layer: "dots"
//             })

//             // Give the dots a slight variance to their velocity
//             const speed = this.config.BASE_DRIFT_SPEED + (Math.random() - 0.5) * this.config.SPEED_VARIANCE
//             const angle = Math.random() * Math.PI * 2
//             const dotComponent = dot.getComponent(BackgroundDotController)
//             dotComponent.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed)

//             this.dots.push(dot)
//         }
//     }
    
//     _drawConnections(ctx) {
//         const spatialMap = SceneManager.currentScene.spatialMap
//         const drawnPairs = new Set()
        
//         this.dots.forEach(dot => {
//             const connections = spatialMap.searchNeighbors(dot, "bgDot", this._hits, this.config.CONNECTION_RADIUS)
            
//             const pos1 = dot.transform.position
            
//             connections.forEach(neighbor => {
//                 // Avoid drawing the same connection twice
//                 const pairKey = dot.id < neighbor.id ?
//                 `${dot.id}-${neighbor.id}` :
//                 `${neighbor.id}-${dot.id}`
                
//                 if (drawnPairs.has(pairKey)) return
//                 drawnPairs.add(pairKey)
                
//                 const pos2 = neighbor.transform.position
//                 const distance = Vector2.distance(pos1, pos2)
                
//                 // Calculate alpha based on distance
//                 const distanceRatio = 1 - (distance / this.config.CONNECTION_RADIUS)
//                 let alpha = distanceRatio * this.config.MAX_LINE_ALPHA
                
//                 // Apply quiet zone factors
//                 const quietFactor1 = this.calcAlphaFactor(pos1.x, pos1.y)
//                 const quietFactor2 = this.calcAlphaFactor(pos2.x, pos2.y)
//                 alpha *= Math.min(quietFactor1, quietFactor2)
                
//                 if (alpha > 0.01) {
//                     ctx.strokeStyle = `rgba(${this.config.BASE_DOT_COLOR.r}, ${this.config.BASE_DOT_COLOR.g}, ${this.config.BASE_DOT_COLOR.b}, ${alpha})`
//                     ctx.lineWidth = 1
//                     ctx.beginPath()
//                     ctx.moveTo(pos1.x, pos1.y)
//                     ctx.lineTo(pos2.x, pos2.y)
//                     ctx.stroke()
//                 }
//             })
//         })
//     }
    
//     /**
//      * Calculates a multiplier for the alpha value based on screen position
//      * @param {Number} x Horizontal position of the point
//      * @param {Number} y Vertical position of the point
//      * @returns {Number} Value between 0-1 to act as a multiplier for alpha
//     */
//    calcAlphaFactor(x, y) {
//        const width = this.canvas.width
//        const height = this.canvas.height
       
//        // Horizontal dimmed zone (vertical center band)
//        const centerX = width / 2
//        const bandHalfWidth = width * this.config.QUIET_ZONE_WIDTH_PERCENT / 2
//        const horizontalDistance = Math.abs(x - centerX)
//        let horizontalFactor = 1

//         if (horizontalDistance < bandHalfWidth) {
//             const normalizedDist = horizontalDistance / bandHalfWidth
//             // Math.pow to speed up how quickly the alpha falls off
//             horizontalFactor = Math.pow(normalizedDist, this.config.QUIET_ZONE_FALLOFF_POWER)
//         }

//         // Variable vertical quiet zone based on x position
//         // Should better follow the angle of the angled floor grid
//         const normalizedXDistance = Math.abs(x - centerX) / (width / 2)
//         const clampedXDistance = Math.min(normalizedXDistance, 1)

//         // Interpolate threshold between center and edge values
//         const verticalThreshold = this.config.QUIET_ZONE_HEIGHT_CENTER +
//             (this.config.QUIET_ZONE_HEIGHT_EDGE - this.config.QUIET_ZONE_HEIGHT_CENTER) * clampedXDistance

//         const bottomThreshold = height * verticalThreshold
//         let verticalFactor = 1

//         if (y > bottomThreshold) {
//             const normalizedDist = (y - bottomThreshold) / (height - bottomThreshold)
//             const clampedDist = Math.min(normalizedDist, 1)
//             verticalFactor = Math.pow(1 - clampedDist, this.config.QUIET_ZONE_FALLOFF_POWER)
//         }

//         // Combine factors (use minimum for strongest quiet effect)
//         return Math.min(horizontalFactor, verticalFactor)
//     }
// }

class DotNetworkController extends Component {
    constructor() {
        super()
        this.dots = []
        this.canvas = null
        this.config = { ...DOT_NETWORK_CONFIG }
        this._hits = []
        this._lineBatch = null
        this._drawnPairs = new Set()
        this._segments = []
    }

    start() {
        this.canvas = document.querySelector("#canv")
        
        // Create LineBatch component for all connection lines
        // Using non-batched mode since each line has its own alpha
        this._lineBatch = this.gameObject.addComponent(new LineBatch(), {
            lineWidth: 1,
            batched: false,
            strokeStyle: (ctx, seg, i) => seg.data?.color ?? "magenta",
            segments: this._segments,
        })
        
        this._spawnDots()
    }
    
    update(dt) {
        // Reset connection counts
        this.dots.forEach(dot => {
            const dotComponent = dot.getComponent(BackgroundDotController)
            dotComponent.connectionCount = 0
        })
        
        // Use spatial map to find and count connections
        const spatialMap = SceneManager.currentScene.spatialMap
        
        this.dots.forEach(dot => {
            const dotComponent = dot.getComponent(BackgroundDotController)
            const connections = spatialMap.searchNeighbors(dot, "bgDot", this._hits, this.config.CONNECTION_RADIUS)
            
            connections.forEach(neighbor => {
                const neighborComponent = neighbor.getComponent(BackgroundDotController)
                dotComponent.connectionCount++
                neighborComponent.connectionCount++
            })
        })
        
        // Build line data for LineBatch
        this._updateConnectionLines()
    }
    
    _updateConnectionLines() {
        const spatialMap = SceneManager.currentScene.spatialMap
        this._drawnPairs.clear()
        
        // Reuse segments array, just clear and refill
        this._segments.length = 0
        
        this.dots.forEach(dot => {
            const connections = spatialMap.searchNeighbors(dot, "bgDot", this._hits, this.config.CONNECTION_RADIUS)
            const pos1 = dot.transform.position
            
            connections.forEach(neighbor => {
                // Avoid drawing the same connection twice
                const pairKey = dot.id < neighbor.id
                    ? `${dot.id}-${neighbor.id}`
                    : `${neighbor.id}-${dot.id}`
                
                if (this._drawnPairs.has(pairKey)) return
                this._drawnPairs.add(pairKey)
                
                const pos2 = neighbor.transform.position
                const distance = Vector2.distance(pos1, pos2)
                
                // Calculate alpha based on distance
                const distanceRatio = 1 - (distance / this.config.CONNECTION_RADIUS)
                let alpha = distanceRatio * this.config.MAX_LINE_ALPHA
                
                // Apply quiet zone factors
                const quietFactor1 = this.calcAlphaFactor(pos1.x, pos1.y)
                const quietFactor2 = this.calcAlphaFactor(pos2.x, pos2.y)
                alpha *= Math.min(quietFactor1, quietFactor2)
                
                if (alpha > 0.01) {
                    this._segments.push({
                        a: pos1,
                        b: pos2,
                        data: {
                            color: `rgba(${this.config.BASE_DOT_COLOR.r},${this.config.BASE_DOT_COLOR.g},${this.config.BASE_DOT_COLOR.b},${alpha})`
                        }
                    })
                }
            })
        })
        
        // Update LineBatch
        this._lineBatch.segments = this._segments
        this._lineBatch.markDirty()
    }
    
    _spawnDots() {
        const width = this.canvas.width
        const height = this.canvas.height
        const padding = this.config.SCREEN_PADDING

        for (let i = 0; i < this.config.NUM_DOTS; i++) {
            const x = Math.random() * (width + padding * 2) - padding
            const y = Math.random() * (height + padding * 2) - padding

            const dot = GameObject.instantiate(new BackgroundDotGameObject(i), {
                scene: SceneManager.currentScene,
                position: new Vector2(x, y),
                layer: "dots"
            })

            const speed = this.config.BASE_DRIFT_SPEED + (Math.random() - 0.5) * this.config.SPEED_VARIANCE
            const angle = Math.random() * Math.PI * 2
            const dotComponent = dot.getComponent(BackgroundDotController)
            dotComponent.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed)
            dotComponent.networkController = this

            this.dots.push(dot)
        }
    }
    
    /**
     * Calculates a multiplier for the alpha value based on screen position
     * @param {Number} x Horizontal position of the point
     * @param {Number} y Vertical position of the point
     * @returns {Number} Value between 0-1 to act as a multiplier for alpha
     */
    calcAlphaFactor(x, y) {
        const width = this.canvas.width
        const height = this.canvas.height
        
        // Horizontal dimmed zone (vertical center band)
        const centerX = width / 2
        const bandHalfWidth = width * this.config.QUIET_ZONE_WIDTH_PERCENT / 2
        const horizontalDistance = Math.abs(x - centerX)
        let horizontalFactor = 1

        if (horizontalDistance < bandHalfWidth) {
            const normalizedDist = horizontalDistance / bandHalfWidth
            horizontalFactor = Math.pow(normalizedDist, this.config.QUIET_ZONE_FALLOFF_POWER)
        }

        // Variable vertical quiet zone based on x position
        const normalizedXDistance = Math.abs(x - centerX) / (width / 2)
        const clampedXDistance = Math.min(normalizedXDistance, 1)

        const verticalThreshold = this.config.QUIET_ZONE_HEIGHT_CENTER +
            (this.config.QUIET_ZONE_HEIGHT_EDGE - this.config.QUIET_ZONE_HEIGHT_CENTER) * clampedXDistance

        const bottomThreshold = height * verticalThreshold
        let verticalFactor = 1

        if (y > bottomThreshold) {
            const normalizedDist = (y - bottomThreshold) / (height - bottomThreshold)
            const clampedDist = Math.min(normalizedDist, 1)
            verticalFactor = Math.pow(1 - clampedDist, this.config.QUIET_ZONE_FALLOFF_POWER)
        }

        return Math.min(horizontalFactor, verticalFactor)
    }
}