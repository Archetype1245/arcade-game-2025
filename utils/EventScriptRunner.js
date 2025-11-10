class EventScriptRunner {
    static scripts = {
        cornerRain: EventScriptRunner.cornerRain,
        ringBurst: EventScriptRunner.ringBurst
    }

    static runScript(scriptId, manager, eventDef) {
        const script = EventScriptRunner.scripts[scriptId]
        if (!script) {
            console.warn(`Unknown event script: ${scriptId}`);
            return
        }

        script(manager, eventDef)
    }

    static cornerRain(manager, eventDef) {
        const { enemyId, perCorner, duration, corners } = eventDef.params

        const cornerEventGO = new GameObject("CornerEvent")
        const controller = new CornerEventController({
            manager,
            corners,
            enemyId,
            perCorner,
            duration
        })
        cornerEventGO.addComponent(controller)

        GameObject.instantiate(cornerEventGO, {
            position: Vector2.zero
        })
    }

    static ringBurst(manager, eventDef) {
        const { enemyId, center, radius, count } = eventDef.params

        const ringEventGO = new GameObject("RingEvent")
        const controller = new RingEventController({
            manager,
            center,
            radius,
            enemyId,
            count,
        })
        ringEventGO.addComponent(controller)

        GameObject.instantiate(ringEventGO, {
            position: Vector2.zero
        })
    }
}