const EnemyDefs = {
    PurpleEnemy: {
        key: "PurpleEnemy",
        type: Config.EnemyTypes.purple,
        beamColor: Config.BeamColors.purpleBeam,
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
        key: "BlueEnemy",
        type: Config.EnemyTypes.blue,
        beamColor: Config.BeamColors.lightBlueBeam,
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
        key: "GreenEnemy",
        type: Config.EnemyTypes.green,
        beamColor: Config.BeamColors.greenBeam,
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
        key: "PinkEnemy",
        type: Config.EnemyTypes.pink,
        beamColor: Config.BeamColors.pinkBeam,
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

        deathSpawns: {
            type: "SmallEnemy",
            count: 2
        }


    },

    SmallEnemy: {
        key: "SmallEnemy",
        type: Config.EnemyTypes.small,
        beamColor: null,
        speed: 275,

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
