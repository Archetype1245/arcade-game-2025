class EnemyGameObject extends GameObject {
    constructor(enemyType) {
        super("EnemyGameObject")

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