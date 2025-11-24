function buildPurpleEnemyBT(controller) {
    const moveSequence = new BTSequence()
    moveSequence.addChild(new BTMoveInDirection(controller))
    moveSequence.addChild(new BTBounceOffWalls(controller))
    
    const rootBehavior = new BTRepeater(-1)
    rootBehavior.addChild(moveSequence)
    
    return rootBehavior
}
