const ParticlePresets = {
    EnemyExplosions: {
        PurpleEnemy: {
            system: "purple",
            composite: "source-over",
            count: new UniformIntDistribution(50, 60),
            speed: new UniformDistribution(150, 350),
            lifetime: new UniformDistribution(0.4, 0.6),
            size: new ConstantDistribution(3),
            length: new UniformDistribution(15, 30),
            color: new UniformColorDistribution(210, 140, 255, 110, 30, 220),
            startAlpha: 0.5,
            endAlpha: 0.0
        },
        BlueEnemy: {
            system: "blue",
            composite: "source-over",
            count: new UniformIntDistribution(50, 60),
            speed: new UniformDistribution(150, 350),
            lifetime: new UniformDistribution(0.4, 0.6),
            size: new ConstantDistribution(3),
            length: new UniformDistribution(15, 30),
            color: new UniformColorDistribution(19, 109, 145, 157, 253, 253),
            startAlpha: 0.5,
            endAlpha: 0.0
        },
        GreenEnemy: {
            system: "green",
            composite: "source-over",
            count: new UniformIntDistribution(50, 60),
            speed: new UniformDistribution(150, 350),
            lifetime: new UniformDistribution(0.4, 0.6),
            size: new ConstantDistribution(3),
            length: new UniformDistribution(15, 30),
            color: new UniformColorDistribution(20, 254, 20, 83, 227, 148),
            startAlpha: 0.5,
            endAlpha: 0.0
        },
        PinkEnemy: {
            system: "pink",
            composite: "source-over",
            count: new UniformIntDistribution(50, 60),
            speed: new UniformDistribution(150, 350),
            lifetime: new UniformDistribution(0.4, 0.6),
            size: new ConstantDistribution(3),
            length: new UniformDistribution(15, 30),
            color: new UniformColorDistribution(255, 127, 165, 255, 173, 203),
            startAlpha: 0.5,
            endAlpha: 0.0
        },
        SmallEnemy: {
            system: "pink",
            composite: "source-over",
            count: new UniformIntDistribution(50, 60),
            speed: new UniformDistribution(150, 350),
            lifetime: new UniformDistribution(0.4, 0.6),
            size: new ConstantDistribution(3),
            length: new UniformDistribution(15, 30),
            color: new UniformColorDistribution(255, 127, 165, 255, 173, 203),
            startAlpha: 0.5,
            endAlpha: 0.0
        }
    }
}