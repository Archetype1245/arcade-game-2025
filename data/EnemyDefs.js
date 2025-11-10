const EnemyDefs = {
    PurpleEnemy: {
        type: Config.enemyTypes.purple,
        beamColor: Config.beamColors.purpleBeam,

        cost: 4,
        weight: 3,
        minIntensity: 0,
        minScore: 0,

        scoreValue: 25,
    },

    BlueEnemy: {
        type: Config.enemyTypes.blue,
        beamColor: Config.beamColors.lightBlueBeam,

        cost: 8,
        weight: 6,
        minIntensity: 0,
        minScore: 50,

        scoreValue: 50,
    },

    GreenEnemy: {
        type: Config.enemyTypes.green,
        beamColor: Config.beamColors.greenBeam,

        cost: 12,
        weight: 4,
        minIntensity: 0,
        minScore: 1000,

        scoreValue: 100,
    },

    PinkEnemy: {
        type: Config.enemyTypes.pink,
        beamColor: Config.beamColors.pinkBeam,

        cost: 12,
        weight: 4,
        minIntensity: 0,
        minScore: 1000,

        scoreValue: 100,
    },
}
