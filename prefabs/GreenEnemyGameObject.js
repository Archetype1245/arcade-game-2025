class GreenEnemyGameObject extends BaseEnemyGameObject {
    constructor(enemyDef) {
        super(enemyDef)
        this.name = "GreenEnemyGameObject"
        
        const controller = this.addComponent(new GreenEnemyController())
        
        const behaviorTree = this.addComponent(new BehaviorTree())
        behaviorTree.node = buildGreenEnemyBT(controller)
    }
}
