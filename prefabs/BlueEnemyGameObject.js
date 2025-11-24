class BlueEnemyGameObject extends BaseEnemyGameObject {
    constructor(enemyDef) {
        super(enemyDef)
        this.name = "BlueEnemyGameObject"
        
        const controller = this.addComponent(new BlueEnemyController())
        
        const behaviorTree = this.addComponent(new BehaviorTree())
        behaviorTree.node = buildBlueEnemyBT(controller)
    }
}
