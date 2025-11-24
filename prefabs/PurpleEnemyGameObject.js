class PurpleEnemyGameObject extends BaseEnemyGameObject {
    constructor(enemyDef) {
        super(enemyDef)
        this.name = "PurpleEnemyGameObject"
        
        const controller = this.addComponent(new PurpleEnemyController())
        
        const behaviorTree = this.addComponent(new BehaviorTree())
        behaviorTree.node = buildPurpleEnemyBT(controller)
    }
}
