import { v4 as uniqueID } from 'uuid'

class Gameboard {
  static size = 10

  constructor(ID = uniqueID()) {
    this.ID = ID
    // Row, Column Matrix notation used throughout
    // Create grid of size x size Matrix populated with null
    this.grid = Array(Gameboard.size)
      .fill(undefined)
      .map(() => Array(Gameboard.size).fill(null))
    // Deep structured clone the grid to create hits matrix
    this.hits = structuredClone(this.grid)
  }

  isValidPlacement(ship, r, c, direction) {
    // For each cell of the ship, calculate the coordinates
    for (let i = 0; i < ship.length; i += 1) {
      const rowPlacement = direction === 'vertical' ? r + i : r
      const colPlacement = direction === 'horizontal' ? c + i : c
      // If that cell is full, the ship overlaps an existing ship
      if (this.grid[rowPlacement][colPlacement]) {
        return false
      }
    }
    return true
  }

  placeShip(ship, r, c, direction) {
    if (!this.isValidPlacement(ship, r, c, direction)) {
      throw new Error('Invalid ship placement location attempted')
    }
    // For each cell of the ship, calculate the coordinates
    for (let i = 0; i < ship.length; i += 1) {
      const rowPlacement = direction === 'vertical' ? r + i : r
      const colPlacement = direction === 'horizontal' ? c + i : c
      // Set that cell to point to the ship
      this.grid[rowPlacement][colPlacement] = { ship, shipID: ship.ID }
    }
  }

  receiveAttack(r, c) {
    if (!this.grid[r][c]) {
      // If the cell is empty, mark a miss (false)
      this.hits[r][c] = false
      return
    }
    // Else, mark a hit (true)
    this.hits[r][c] = true
    // Then call hit on the ship in that cell
    this.grid[r][c].ship.hit()
  }

  areAllSunk() {
    // If any one cell in the grid is non-empty and non-hit, return false. Else, true
    return this.grid.every((rowArr, r) => rowArr.every((cell, c) => !cell || this.hits[r][c]))
  }
}

export default Gameboard
