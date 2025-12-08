class SmallEnemyGameObject extends BaseEnemyGameObject {
    constructor(enemyDef) {
        super(enemyDef)
        this.name = "SmallEnemyGameObject"
        
        const controller = this.addComponent(new SmallEnemyController())

        const behaviorTree = this.addComponent(new BehaviorTree())
        behaviorTree.node = buildSmallEnemyBT(controller)
    }
}