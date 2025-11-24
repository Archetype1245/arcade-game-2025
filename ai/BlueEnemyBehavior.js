function buildBlueEnemyBT(controller) {
    const chaseSequence = new BTSequence()
    chaseSequence.addChild(new BTMoveTowardsPlayer(controller))
    chaseSequence.addChild(new BTClampInsidePlayableBounds(controller))
    
    const rootBehavior = new BTRepeater(-1)
    rootBehavior.addChild(chaseSequence)
    
    return rootBehavior
}
