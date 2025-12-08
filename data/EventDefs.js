const b = Config.playable
const inset = 30
const corners = [
    new Vector2(b.x1 + inset, b.y1 + inset),
    new Vector2(b.x1 + inset, b.y2 - inset),
    new Vector2(b.x2 - inset, b.y1 + inset),
    new Vector2(b.x2 - inset, b.y2 - inset),
]

// Corner Events
const EventDefs = {
    blue_corner_rain: {
        id: "blue_corner_rain",
        cost: 30,
        cooldown: 14,
        weight: 3,
        minIntensity: 30,
        minScore: 2000,
        duration: 5,
        scriptId: "cornerRain",

        params: {
            enemyId: "BlueEnemy",
            perCorner: 15,
            duration: 6,
            corners: corners,
        },
    },

    green_corner_rain: {
        id: "green_corner_rain",
        cost: 40,
        cooldown: 16,
        weight: 2,
        minIntensity: 40,
        minScore: 4000,
        duration: 5,
        scriptId: "cornerRain",

        params: {
            enemyId: "GreenEnemy",
            perCorner: 15,
            duration: 6,
            corners: corners,
        },
    },

    pink_corner_rain: {
        id: "pink_corner_rain",
        cost: 50,
        cooldown: 18,
        weight: 1,
        minIntensity: 50,
        minScore: 7000,
        duration: 5,
        scriptId: "cornerRain",

        params: {
            enemyId: "PinkEnemy",
            perCorner: 15,
            duration: 6,
            corners: corners,
        },
    },

    // Ring Events
    blue_ring_burst: {
        id: "blue_ring_burst",
        cost: 40,
        cooldown: 18,
        weight: 3,
        minIntensity: 40,
        minScore: 2500,
        duration: 3,
        scriptId: "ringBurst",

        params: {
            enemyId: "BlueEnemy",
            center: { x: 900, y: 600 },
            radius: 400,
            count: 20,
        },
    },

    green_ring_burst: {
        id: "green_ring_burst",
        cost: 50,
        cooldown: 21,
        weight: 2,
        minIntensity: 50,
        minScore: 4500,
        duration: 3.5,
        scriptId: "ringBurst",

        params: {
            enemyId: "GreenEnemy",
            center: { x: 900, y: 600 },
            radius: 400,
            count: 24,
        },
    },

    pink_ring_burst: {
        id: "pink_ring_burst",
        cost: 60,
        cooldown: 24,
        weight: 1,
        minIntensity: 60,
        minScore: 8000,
        duration: 4,
        scriptId: "ringBurst",

        params: {
            enemyId: "PinkEnemy",
            center: { x: 900, y: 600 },
            radius: 400,
            count: 30,
        },
    },
}
