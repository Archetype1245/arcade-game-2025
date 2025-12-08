function buildSmallEnemyBT(controller) {
    const movementSequence = new BTSequence()
    movementSequence.addChild(new BTMoveOrbitCenterTowardsPlayer(controller))
    movementSequence.addChild(new BTClampOrbitInsidePlayableBounds(controller))
    
    const rootBehavior = new BTRepeater(-1)
    rootBehavior.addChild(movementSequence)
    
    return rootBehavior
}

class BTMoveOrbitCenterTowardsPlayer extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const player = this.controller.player || GameObject.getObjectByName("PlayerGameObject")
        if (!player) {
            return BehaviorTree.FAILED
        }

        const playerPos = player.transform.position
        const orbitCenter = this.controller.orbitCenterPos
        
        const dir = playerPos.minus(orbitCenter).normalize()
        const speed = this.controller.speed
        
        // Move orbit center towards player
        orbitCenter.plusEquals(dir.times(speed * Time.deltaTime))

        return BehaviorTree.SUCCEEDED
    }
}

class BTClampOrbitInsidePlayableBounds extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const bounds = Config.playable
        const orbitCenter = this.controller.orbitCenterPos
        const orbitRadius = this.controller.currentOrbitRadius
        const enemyRadius = this.controller.radius
        
        // Total radius is orbit radius plus enemy size
        const totalRadius = orbitRadius + enemyRadius
        
        const minX = bounds.x1 + totalRadius
        const maxX = bounds.x2 - totalRadius
        const minY = bounds.y1 + totalRadius
        const maxY = bounds.y2 - totalRadius

        // Clamp orbit center position so the orbiting enemy stays within bounds
        orbitCenter.x = Math.min(Math.max(orbitCenter.x, minX), maxX)
        orbitCenter.y = Math.min(Math.max(orbitCenter.y, minY), maxY)

        return BehaviorTree.SUCCEEDED
    }
}