class CellMap {
    constructor(cellSize=64) {
        this.cs = cellSize
        this.cellData = new Map()
        this.shift = 6
    }

    keyFromPos(x, y) { return `${Math.floor(x/this.cs)},${Math.floor(y/this.cs)}` }
    keyFromCell(i, j) { return `${i},${j}` }

    insert(object) {
        if (!object.cellKey) {
            const t = object.transform.position
            object.cellKey = this.keyFromPos(t.x, t.y)
        }

        let cell = this.cellData.get(object.cellKey)
        if (!cell) this.cellData.set(object.cellKey, cell = new Set())
        cell.add(object)
    }

    remove(object) {
        const cell = this.cellData.get(object.cellKey)
        if (cell) {
            cell.delete(object)
            if (!cell.size) this.cellData.delete(object.cellKey)
        }
    }

    update(object) {
        const p = object.transform._position
        const newKey = this.keyFromPos(p.x, p.y)
        if (newKey === object.cellKey) return

        this.remove(object)
        object.cellKey = newKey
        this.insert(object)
    }

    searchNeighbors(object, type, hits=[], subType=0, radius=this.cs) {
        const t = object.transform.position
        const i0 = (t.x - radius) >> this.shift;  const i1 = (t.x + radius) >> this.shift
        const j0 = (t.y - radius) >> this.shift;  const j1 = (t.y + radius) >> this.shift
        // const i0 = Math.floor((t.x - radius) / this.cs);  const i1 = Math.floor((t.x + radius) / this.cs)
        // const j0 = Math.floor((t.y - radius) / this.cs);  const j1 = Math.floor((t.y + radius) / this.cs)

        hits.length = 0
        for (let i = i0; i <= i1; i++) {
            for (let j = j0; j <= j1; j++) {
                const cell = this.cellData.get(this.keyFromCell(i, j))
                if (!cell) continue

                for (const target of cell) {
                    if (target === object) continue  // Skip over self
                    // Bitwise AND will return 0 here if the object type is different from the search parameter type,
                    // and we can safely skip over that object.
                    if ((target.type & type) === 0) continue
                    if (subType && (target.subType & subType) === 0 ) continue  // Similarly, skip over objects that don't match the subtype (if one is passed)
                    hits.push(target)
                }
            }
        }
        return hits
    }
}