class BTMoveTowardsPlayer extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const player = this.controller.player || GameObject.getObjectByName("PlayerGameObject")
        if (!player) {
            return BehaviorTree.FAILED
        }

        const transform = this.controller.transform
        const playerPos = player.transform.position
        let pos = transform.position

        const dir = playerPos.getDirectionVector(pos)
        const speed = this.controller.speed
        pos.plusEquals(dir.times(speed * Time.deltaTime))

        transform.position = pos

        return BehaviorTree.SUCCEEDED
    }
}

// Generalized to handle shape bounds (for weird shapes like the Blue enemy), otherwise defaults to bounds based on radius
class BTClampInsidePlayableBounds extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const bounds = Config.playable

        let shapeBounds = setShapeBounds(this.controller)

        const minX = bounds.x1 - shapeBounds.left
        const maxX = bounds.x2 - shapeBounds.right
        const minY = bounds.y1 - shapeBounds.top
        const maxY = bounds.y2 - shapeBounds.bot

        // Clamp position to stay inside bounds
        pos.x = Math.min(Math.max(pos.x, minX), maxX)
        pos.y = Math.min(Math.max(pos.y, minY), maxY)

        transform.position = pos

        return BehaviorTree.SUCCEEDED
    }
}

// Move in a fixed direction
class BTMoveInDirection extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const speed = this.controller.speed || 100

        // Move in the controller's direction
        pos.plusEquals(this.controller.dir.times(speed * Time.deltaTime))

        transform.position = pos

        return BehaviorTree.SUCCEEDED
    }
}

// Bounce off walls when hitting boundaries
class BTBounceOffWalls extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const bounds = Config.playable

        let shapeBounds = setShapeBounds(this.controller)

        // Check bounds and flip direction if needed
        if (pos.x < bounds.x1 - shapeBounds.left) {
            pos.x = bounds.x1 - shapeBounds.left
            this.controller.dir.x *= -1
        } else if (pos.x > bounds.x2 - shapeBounds.right) {
            pos.x = bounds.x2 - shapeBounds.right
            this.controller.dir.x *= -1
        }

        if (pos.y < bounds.y1 - shapeBounds.top) {
            pos.y = bounds.y1 - shapeBounds.top
            this.controller.dir.y *= -1
        } else if (pos.y > bounds.y2 - shapeBounds.bot) {
            pos.y = bounds.y2 - shapeBounds.bot
            this.controller.dir.y *= -1
        }

        transform.position = pos

        return BehaviorTree.SUCCEEDED
    }
}

// Face towards the player
class BTFacePlayer extends BTNode {
    constructor(controller) {
        super()
        this.controller = controller
    }

    update(tree) {
        const player = this.controller.player || GameObject.getObjectByName("PlayerGameObject")
        if (!player) {
            return BehaviorTree.FAILED
        }

        const transform = this.controller.transform
        const playerPos = player.transform.position
        const myPos = transform.position

        const dir = playerPos.getDirectionVector(myPos)
        const angle = Math.atan2(dir.y, dir.x)

        transform.setRotation(angle)

        return BehaviorTree.SUCCEEDED
    }
}

// Simple directional movement nodes
class BTMoveLeft extends BTNode {
    constructor(controller, speed = 100) {
        super()
        this.controller = controller
        this.speed = speed
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const movement = new Vector2(-this.speed * Time.deltaTime, 0)
        pos.plusEquals(movement)
        transform.position = pos
        return BehaviorTree.SUCCEEDED
    }
}

class BTMoveRight extends BTNode {
    constructor(controller, speed = 100) {
        super()
        this.controller = controller
        this.speed = speed
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const movement = new Vector2(this.speed * Time.deltaTime, 0)
        pos.plusEquals(movement)
        transform.position = pos
        return BehaviorTree.SUCCEEDED
    }
}

class BTMoveUp extends BTNode {
    constructor(controller, speed = 100) {
        super()
        this.controller = controller
        this.speed = speed
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const movement = new Vector2(0, -this.speed * Time.deltaTime)
        pos.plusEquals(movement)
        transform.position = pos
        return BehaviorTree.SUCCEEDED
    }
}

class BTMoveDown extends BTNode {
    constructor(controller, speed = 100) {
        super()
        this.controller = controller
        this.speed = speed
    }

    update(tree) {
        const transform = this.controller.transform
        let pos = transform.position
        const movement = new Vector2(0, this.speed * Time.deltaTime)
        pos.plusEquals(movement)
        transform.position = pos
        return BehaviorTree.SUCCEEDED
    }
}

// Sets the specific bounds for each shape (enemy).
// Generalized to work with weird shapes (blue enemies), otherwise defaults to use the enemy's radius (or zero if radius is missing)
function setShapeBounds(controller) {
    let shapeBounds
    if (controller.shapeBounds) {
        shapeBounds = controller.shapeBounds
    } else {
        const radius = controller.radius || 0
        shapeBounds = {
            left: -radius,
            right: radius,
            top: -radius,
            bot: radius
        }
    }
    return shapeBounds
}