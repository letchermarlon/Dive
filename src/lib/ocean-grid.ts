import type { GridTile } from '@/types'

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function hashStr(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function seededRand(seed: number) {
  let s = (seed ^ 0x9e3779b9) >>> 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s = s >>> 0
    return s / 0xffffffff
  }
}

export function generateIsland(userId: string, count = 25): GridTile[] {
  const rand = seededRand(hashStr(userId))
  const tiles: GridTile[] = [{ col: 0, row: 0 }]
  const tileSet = new Set(['0,0'])

  while (tiles.length < count) {
    const frontier: GridTile[] = []
    const fSet = new Set<string>()
    for (const { col, row } of tiles) {
      for (const [dc, dr] of DIRS) {
        const nc = col + dc, nr = row + dr
        const k = `${nc},${nr}`
        if (!tileSet.has(k) && !fSet.has(k)) {
          fSet.add(k)
          frontier.push({ col: nc, row: nr })
        }
      }
    }
    const pick = frontier[Math.floor(rand() * frontier.length)]
    tiles.push(pick)
    tileSet.add(`${pick.col},${pick.row}`)
  }

  return tiles
}

export function expandIsland(tiles: GridTile[], userId: string): GridTile[] {
  // Seed varies with tile count so each expansion step picks a different tile
  const seed = hashStr(userId) ^ Math.imul(tiles.length, 0x9e3779b9)
  const rand = seededRand(seed >>> 0)
  const tileSet = new Set(tiles.map(t => `${t.col},${t.row}`))
  const frontier: GridTile[] = []
  const fSet = new Set<string>()

  for (const { col, row } of tiles) {
    for (const [dc, dr] of DIRS) {
      const nc = col + dc, nr = row + dr
      const k = `${nc},${nr}`
      if (!tileSet.has(k) && !fSet.has(k)) {
        fSet.add(k)
        frontier.push({ col: nc, row: nr })
      }
    }
  }

  if (frontier.length === 0) return tiles
  const pick = frontier[Math.floor(rand() * frontier.length)]
  return [...tiles, pick]
}

export function expandIslandToCount(tiles: GridTile[], userId: string, targetCount: number): GridTile[] {
  let current = tiles
  while (current.length < targetCount) {
    current = expandIsland(current, userId)
  }
  return current
}
