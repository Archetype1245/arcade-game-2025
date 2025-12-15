class Config {
    static Camera = {
        coverage: 1,
        aspect: 16 / 9,
        zoom: 1
    }

    static Playable = {
        x1: 0, y1: 0,
        x2: 1800, y2: 1200,
        w: 1800, h: 1200,
    }

    static Player = {
        speed: 500,
        deathFreeze: 1.5  // seconds
    }

    static Lasers = {
        speed: 1400
    }

    static Ship = {
        shape: [
            new Vector2(-1, 0),
            new Vector2(0, -2),
            new Vector2(2.5, -1.75),
            new Vector2(-1, -3),
            new Vector2(-2.5, 0),
            new Vector2(-1, 3),
            new Vector2(2.5, 1.75),
            new Vector2(0, 2)
        ]
    }

    static TrailPresets = {
        player: {
            anchorOffset: new Vector2(-1, 0),
            duration: 0.5,
            maxPoints: 100,
            minDistance: 0.4,
            maxInterval: 0.01,
            widthStart: 60,
            widthEnd: 20,
            alphaStart: 0.4,
            alphaEnd: 0,
            color: { r: 255, g: 255, b: 255, a: 1 },
            pauseWhenStationary: true,
            stationaryThreshold: 10
        },
        laser: {
            anchorOffset: new Vector2(-1, 0),
            duration: 0.05,
            maxPoints: 20,
            minDistance: 0.4,
            maxInterval: 0.01,
            widthStart: 16,
            widthEnd: 4,
            alphaStart: 0.4,
            alphaEnd: 0,
            color: { r: 255, g: 196, b: 0, a: 1 },
            pauseWhenStationary: false
        }
    }

    static Shapes = {
        ship: {
            rotation: -Math.PI / 2, // Rotate -90 deg to point up
            points: [
                new Vector2(-1, 0),
                new Vector2(0, -2),
                new Vector2(2.5, -1.75),
                new Vector2(-1, -3),
                new Vector2(-2.5, 0),
                new Vector2(-1, 3),
                new Vector2(2.5, 1.75),
                new Vector2(0, 2)
            ]
        },
        crown: {
            rotation: 0,
            points: [
                new Vector2(-3, 1.5), 
                new Vector2(-4, -2.5),
                new Vector2(-2.5, -1.0),
                new Vector2(-2, -2.25),
                new Vector2(-0.90, -1.0),
                new Vector2(0, -3.5),
                new Vector2(0.90, -1.0),
                new Vector2(1.75, -2.25),
                new Vector2(2.5, -1.0), 
                new Vector2(4, -2.5),
                new Vector2(3, 1.5)   
            ]
        },
        settings: {
            rotation: 0,
            // Generated points, rather than 32 hard-coded entries
            points: (() => {
                const points = []
                const teeth = 8
                const rOut = 2.6
                const rIn = 1.8
                const step = (Math.PI * 2) / teeth
                
                const halfTop = 0.14
                const halfBase = 0.30

                for (let i = 0; i < teeth; i++) {
                    const angle = i * step
                    
                    const toothAngles = [
                        angle - halfBase,
                        angle - halfTop,
                        angle + halfTop,
                        angle + halfBase
                    ]
                    const radii = [rIn, rOut, rOut, rIn]

                    for (let j = 0; j < 4; j++) {
                        points.push(new Vector2(
                            Math.cos(toothAngles[j]) * radii[j], 
                            Math.sin(toothAngles[j]) * radii[j]
                        ))
                    }
                }
                return points
            })()
        }
    }

    static EnemyTypes = {
        purple: 0,
        blue: 1,
        green: 2,
        pink: 3,
        small: 4
    }

    static Colors = {
        arenaBackground: "rgba(0, 16, 42, 1)",
        gameBackground: "rgba(0, 61, 88, 1)",
        menuBackground: "rgba(3, 58, 82, 1)",
        red: "rgba(167, 0, 0, 1)",
        pinkBase: "rgba(252, 148, 184, .7)",
        pinkHi: "rgba(255, 173, 203, .7)",
        pinkLow: "rgba(255, 127, 165, .7)",
        pinkUpperLines: "rgba(250, 237, 248, 1)",
        pinkBottomLines: "rgba(254, 146, 240, 0.7)",
        lightblueLinesFront: "rgba(106, 244, 252, 0.8)",
        lightblueLinesBack: "rgba(66, 221, 230, 0.4)",
        lightblueLow: "rgba(15, 44, 59, 0.7)",
        lightblueM: "rgba(19, 109, 145, 0.7)",
        lightblueT: "rgba(73, 246, 255, .1)",
        lightblueHi: "rgba(157, 253, 253, 0.7)",
        greenHi: "rgba(83, 227, 148, 0.5)",
        greenBase: "rgba(20, 254, 20, 0.4)",
        greenLow: "rgba(42, 180, 85, 0.4)",
        greenUpperLines: "rgba(17, 251, 17, 1)",
        greenBottomLines: "rgba(61, 176, 61, 0.6)",
        blue: "rgba(3, 13, 200, 1)",
        purpleLine: "rgba(229, 181, 255, 1)",
        purpleFill: "rgba(140, 39, 254, .8 )",
        player: "rgba(174, 248, 253, 1)"
    }

    static BeamColors = {
        purpleBeam: { r: 140, g: 100, b: 255 },
        lightBlueBeam: { r: 80, g: 200, b: 240 },
        greenBeam: { r: 40, g: 250, b: 100 },
        pinkBeam: { r: 255, g: 170, b: 220 },
    }

    static Layers = {
        MainMenu: {
            background: "background",
            grid: "grid",
            dots: "dots",
            carouselBack: "carouselBack",
            projectorBeam: "projectorBeam",
            carouselMid: "carouselMid",
            carouselFront: "carouselFront",
            ui: "ui"
        },
        Game: {
            background: "background",
            grid: "grid",
            effects: "effects",
            enemies: "enemies",
            player: "player",
            higheffects: "high effects",
            ui: "ui",
            debug: "debug"
        }
    }

    static PlayerFirePatterns = {
        base: {
            // 2 barrels, both shoot straight
            cooldown: 0.20,
            barrels: [
                { sideOffset: -10, angleDeg: 0 },
                { sideOffset: +10, angleDeg: 0 },
            ],
        },
        triple: {
            // 3 barrels, 100% faster, angled shots
            cooldown: 0.20 * (0.5),
            barrels: [
                { sideOffset: -7, angleDeg: -6 },
                { sideOffset: 0, angleDeg: 0 },
                { sideOffset: +7, angleDeg: +6 },
            ],
        },
        quint: {
            // 5 barrels, 50% faster, angled shots
            cooldown: 0.20 * (0.6667),
            barrels: [
                { sideOffset: -6, angleDeg: -7 },
                { sideOffset: -3, angleDeg: -4 },
                { sideOffset: 0, angleDeg: 0 },
                { sideOffset: +3, angleDeg: +4 },
                { sideOffset: +6, angleDeg: +7 },
            ]
        }
    }

}
