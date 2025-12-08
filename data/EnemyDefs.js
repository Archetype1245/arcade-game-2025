const EnemyDefs = {
    PurpleEnemy: {
        type: Config.enemyTypes.purple,
        beamColor: Config.beamColors.purpleBeam,
        speed: 200,

        cost: 4,
        weight: 3,
        minIntensity: 0,
        minScore: 0,
        scoreValue: 25,

        deathExplosion: {
            palette: ["#ff4bd8", "#ff9df0"],
            size: 1.2,
            count: 24
        }
    },

    BlueEnemy: {
        type: Config.enemyTypes.blue,
        beamColor: Config.beamColors.lightBlueBeam,
        speed: 350,

        cost: 8,
        weight: 6,
        minIntensity: 0,
        minScore: 50,
        scoreValue: 50,

        deathExplosion: {
            palette: ["#ff4bd8", "#ff9df0"],
            size: 1.2,
            count: 24
        }
    },

    GreenEnemy: {
        type: Config.enemyTypes.green,
        beamColor: Config.beamColors.greenBeam,
        speed: 400,

        cost: 12,
        weight: 4,
        minIntensity: 0,
        minScore: 1000,
        scoreValue: 100,

        deathExplosion: {
            palette: ["#ff4bd8", "#ff9df0"],
            size: 1.2,
            count: 24
        }
    },

    PinkEnemy: {
        type: Config.enemyTypes.pink,
        beamColor: Config.beamColors.pinkBeam,
        speed: 425,

        cost: 12,
        weight: 4,
        minIntensity: 0,
        minScore: 1000,
        scoreValue: 100,

        deathExplosion: {
            palette: ["#ff4bd8", "#ff9df0"],
            size: 1.2,
            count: 24
        },

        deathSpawns: [{
            type: Config.enemyTypes.small,
            count: 2
        }]


    },

    SmallEnemy: {
        type: Config.enemyTypes.small,
        beamColor: null,
        speed: 300,

        cost: 0,
        weight: 0,
        minIntensity: 0,
        minScore: 0,
        scoreValue: 50,

        deathExplosion: {
            palette: ["#ff4bd8", "#ff9df0"],
            size: 1.2,
            count: 24
        }
    }
}
