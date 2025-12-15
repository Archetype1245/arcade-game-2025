class SmallEnemyController extends Component {
    start() {
        this.player = GameObject.getObjectByName("PlayerGameObject")
        
        this.size = 19
        this.radius = this.size
        this.transform.setScale(this.size)
        
        this.orbitCenterPos = this.transform.position
        this.currentOrbitRadius = 0
        this.finalOrbitRadius = 100
        this.orbitRadiusGrowthRate = 100
        
        this.orbitDirection = Math.random() < 0.5 ? -1 : 1
        this.orbitSpeed = 7.5 // radians per second
        this.orbitAngle = Math.random() * Math.PI * 2
        
        this.speed = EnemyDefs.SmallEnemy.speed
        
        this.defs = {
            left: new Vector2(-1, 0), right: new Vector2(1, 0),
            top: new Vector2(0, -1), bot: new Vector2(0, 1),
            tM: new Vector2(-0.05, -0.125),
            bM: new Vector2(0.05, 0.125)
        }
        
        this.gameObject.collider.points = [this.defs.left, this.defs.bot, this.defs.right, this.defs.top]
        
        this.topLeftPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.top, this.defs.left, this.defs.tM],
            fillStyle: Config.Colors.pinkHi,
        })
        
        this.midShadePolys = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.top, this.defs.tM, this.defs.right],
                [this.defs.bot, this.defs.tM, this.defs.left]
            ],
            fillStyle: Config.Colors.pinkBase,
        })
        
        this.bottomRightPoly = this.gameObject.addComponent(new Polygon(), {
            points: [this.defs.bot, this.defs.right, this.defs.tM],
            fillStyle: Config.Colors.pinkLow,
        })
        
        this.lowerLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.left, this.defs.bM, this.defs.right],
                [this.defs.bot, this.defs.bM, this.defs.top]
            ],
            strokeStyle: Config.Colors.pinkBottomLines,
            closePath: false,
            fill: false,
            lineWidth: 1
        })
        
        this.upperLines = this.gameObject.addComponent(new Polygon(), {
            points: [
                [this.defs.left, this.defs.top, this.defs.right, this.defs.bot],
                [this.defs.bot, this.defs.tM, this.defs.top],
                [this.defs.left, this.defs.tM, this.defs.right]
            ],
            strokeStyle: Config.Colors.pinkUpperLines,
            closePath: false,
            fill: false,
            lineWidth: 1
        })
        
        this.polys = [this.gameObject.collider, this.lowerLines, this.upperLines, this.midShadePolys,
                      this.topLeftPoly, this.bottomRightPoly]
    }
    
    update() {
        const dt = Time.deltaTime
        
        if (this.currentOrbitRadius < this.finalOrbitRadius) {
            this.currentOrbitRadius += this.orbitRadiusGrowthRate * dt
            this.currentOrbitRadius = Math.min(this.currentOrbitRadius, this.finalOrbitRadius)
        }
        
        this.orbitAngle += this.orbitSpeed * this.orbitDirection * dt
        
        const offsetX = Math.cos(this.orbitAngle) * this.currentOrbitRadius
        const offsetY = Math.sin(this.orbitAngle) * this.currentOrbitRadius
        
        this.transform.position = new Vector2(
            this.orbitCenterPos.x + offsetX,
            this.orbitCenterPos.y + offsetY
        )

        // Update visual polygons
        this.polys.forEach(p => p.markDirty())
    }
}