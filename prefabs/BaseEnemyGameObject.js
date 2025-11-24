class BaseEnemyGameObject extends GameObject {
    constructor(enemyDef) {
        super("BaseEnemyGameObject")
        this.tag = "enemy"
        this.enemyDef = enemyDef
        
        this.collider = this.addComponent(new PolygonCollider())
    }
}
