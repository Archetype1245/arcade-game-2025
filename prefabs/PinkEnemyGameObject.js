class PinkEnemyGameObject extends BaseEnemyGameObject {
    constructor(enemyDef) {
        super(enemyDef)
        this.name = "PinkEnemyGameObject"
        
        const controller = this.addComponent(new PinkEnemyController())
        
        const behaviorTree = this.addComponent(new BehaviorTree())
        behaviorTree.node = buildPinkEnemyBT(controller)
    }
}
