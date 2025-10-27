class EnemyGameObject extends GameObject {
    constructor(enemyType) {
        super("EnemyGameObject")
        this.type = Config.objectType.enemy
        this.subType = enemyType
        this.cellData = Engine.currentScene.cellData
        this.cellData.insert(this)

        this.collider = this.addComponent(new PolygonCollider())

        switch (enemyType) {
            case Config.enemyTypes.purple:
                this.addComponent(new PurpleEnemyController())
                break
            case Config.enemyTypes.blue:
                this.addComponent(new BlueEnemyController())
                break
            case Config.enemyTypes.pink:
                this.addComponent(new PinkEnemyController())
                break
            case Config.enemyTypes.green:
                this.addComponent(new GreenEnemyController())
                break
        }
    }
}