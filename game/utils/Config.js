class Config {
    static camera = {
        coverage: 1,
        aspect: 16/9,
        zoom: 1
    }

    static lighting = {
        background: "#00102aff",
        lightDirection: { x: -2, y: -3},
        lightStrength: 0.2,
        shadowStrength: 0.2,
        highlightColor: "#fff",
        shadowColor: "#000"
    }
    static playable = { x1: 0, y1: 0, x2: 1800, y2: 1200, w: 1800, h: 1200 }
    static speed = {
        player: 500
    }
    static colors = {
        background: "#00102aff",
        red: "rgba(167, 0, 0, 1)",
        pinkBase: "rgba(252, 148, 184, .8)",
        pinkHi: "rgba(255, 173, 203, .8)",
        pinkLow: "rgba(255, 127, 165, .8)",
        pinkUpperLines: "rgba(250, 237, 248, 1)",
        pinkBottomLines: "rgba(250, 126, 231, 0.6)",
        lightblueLinesFront: "rgba(106, 244, 252, 0.6)",
        lightblueLinesBack: "rgba(73, 246, 255, .2)",
        lightblueLow: "rgba(10, 30, 40, .7)",
        lightblueM: "rgba(15, 89, 118, .7)",
        lightblueT: "rgba(73, 246, 255, .1)",
        lightblueHi: "rgba(157, 253, 253, 0.7)",
        greenHi: "rgba(83, 227, 148, 0.5)",
        greenBase: "rgba(20, 254, 20, 0.4)",
        greenLow: "rgba(42, 180, 85, 0.4)",
        greenUpperLines: "rgba(17, 251, 17, 1)",
        greenBottomLines: "rgba(61, 176, 61, 0.6)",
        blue: "rgba(3, 13, 200, 1)",
        purpleLine: "rgba(229, 181, 255, 1)",
        purpleFill: "rgba(140, 39, 254, 1)",
        player: "rgba(174, 248, 253, 1)"
    }

    static enemyTypes = {
        purple: "purple",
        blue: "blue",
        pink: "pink",
        green: "green"
    }
    static animations = {
        totalNodeRotations: 3,
        // Times in ms
        fallSpeed: 1.75,
        fallDelay: 80,
        rotation: 150
    }

    static layers = {
        background: "background",
        grid: "grid",
        effects: "effects",
        enemies: "enemies",
        player: "player",
        ui: "ui",
        debug: "debug"
    }
}
