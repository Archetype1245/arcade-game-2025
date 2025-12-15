// const GREEN_DODGE_COOLDOWN = 0.125
const GREEN_DODGE_COOLDOWN = 0
const GREEN_DODGE_DURATION = 0.125        
const GREEN_DODGE_SPEED = 800           
const GREEN_LASER_DETECT_RADIUS = 150
const GREEN_MIN_THREAT_ALIGNMENT = 0.3
const GREEN_DIRECT_HIT_ALIGNMENT = 0.95

// Helper function to get nearby lasers
function getNearbyLasers(go, radius) {
    const scene = SceneManager.currentScene
    if (!scene || !scene.spatialMap) return []
    
    const hits = []
    scene.spatialMap.searchNeighbors(go, "laser", hits, radius)
    return hits
}

function buildGreenEnemyBT(controller) {
    // Initialize state values on the enemy's controller
    controller.dodgeCooldown = 0
    controller.dodgeDirection = null
    controller.isDodging = false
    
    const chaseSequence = new BTSequence()
    chaseSequence.addChild(new BTMoveTowardsPlayer(controller))
    chaseSequence.addChild(new BTClampInsidePlayableBounds(controller))
    
    // Run both dodge movement and positional clamping
    // Parallel so the clamping happens every frame, rather than only once after the dodge finishes
    const dodgeMovementParallel = new BTParallel()
    dodgeMovementParallel.addChild(new BTPerformDodgeMovement(controller))        // Dodge cooldown currently set to 0
    dodgeMovementParallel.addChild(new BTClampInsidePlayableBounds(controller))
    
    const dodgeSequence = new BTSequence()
    dodgeSequence.addChild(new BTCheckShouldDodge(controller))
    dodgeSequence.addChild(dodgeMovementParallel)
    
    // Selector to either try dodging or revert to default chase behavior
    const mainBehavior = new BTSelector()
    mainBehavior.addChild(dodgeSequence)
    mainBehavior.addChild(chaseSequence)
    
    const rootBehavior = new BTRepeater(-1)
    rootBehavior.addChild(mainBehavior)
    
    return rootBehavior
}

// Check if there's a good opportunity to dodge an incoming laser
class BTCheckShouldDodge extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }
    
    update(tree) {
        if (this.controller.dodgeCooldown > 0) {
            this.controller.dodgeCooldown -= Time.deltaTime
        }
        
        // Can't dodge if on cooldown or already dodging
        if (this.controller.dodgeCooldown > 0 || this.controller.isDodging) {
            return BehaviorTree.FAILED
        }
        
        const lasers = getNearbyLasers(this.controller.gameObject, GREEN_LASER_DETECT_RADIUS)
        if (lasers.length === 0) {
            return BehaviorTree.FAILED
        }
        
        const myPos = tree.transform.position
        
        for (const laser of lasers) {
            const laserPos = laser.transform.position
            
            const laserController = laser.getComponent(LaserController)
            if (!laserController) continue
            
            const laserDir = new Vector2(laserController.cos, laserController.sin)
            
            // Calculate if laser is heading toward us
            let laserToEnemy = myPos.minus(laserPos)
            const toEnemyNorm = laserToEnemy.normalize()
            const aimAlignment = laserDir.dot(toEnemyNorm)
            
            // Skip lasers not heading our way / skip well-aimed shots
            if (aimAlignment < GREEN_MIN_THREAT_ALIGNMENT) continue
            if (aimAlignment > GREEN_DIRECT_HIT_ALIGNMENT) continue
            
            // Get perpendicular to laser direction
            const perpDir = laserDir.orthogonal()
            
            // Determine which perpendicular direction moves away from the laser's path
            const perpDistance = laserToEnemy.dot(perpDir)
            
            // Choose the perpendicular direction that moves us further from the laser line
            const dodgeDir = perpDistance > 0 ? perpDir : perpDir.times(-1)
            
            this.controller.dodgeDirection = dodgeDir.normalize()
            this.controller.isDodging = true
            this.controller.dodgeTimeRemaining = GREEN_DODGE_DURATION
            return BehaviorTree.SUCCEEDED
        }
        
        return BehaviorTree.FAILED
    }
}

class BTPerformDodgeMovement extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }
    
    update(tree) {
        if (!this.controller.isDodging || !this.controller.dodgeDirection) {
            return BehaviorTree.FAILED
        }
        
        // Update dodge timer
        this.controller.dodgeTimeRemaining -= Time.deltaTime
        
        if (this.controller.dodgeTimeRemaining <= 0) {
            // Dodge complete
            this.controller.isDodging = false
            this.controller.dodgeDirection = null
            this.controller.dodgeCooldown = GREEN_DODGE_COOLDOWN
            return BehaviorTree.SUCCEEDED
        }
        
        // Perform dodge movement
        const transform = this.controller.transform
        let pos = transform.position
        const dodgeMovement = this.controller.dodgeDirection.times(GREEN_DODGE_SPEED * Time.deltaTime)
        pos.plusEquals(dodgeMovement)
        transform.position = pos
        
        return BehaviorTree.RUNNING
    }
}
