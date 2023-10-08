class Gameboard {
  constructor() {
    // Row, Column Matrix notation used throughout
    const size = 10
    // Create grid of 10x10 Matrix populated with null
    this.grid = Array(size)
      .fill(undefined)
      .map(() => Array(size).fill(null))
    // Deep structured clone the grid to create hits matrix
    this.hits = structuredClone(this.grid)
  }

  placeShip(ship, r, c, direction) {
    // For each cell of the ship, calculate the coordinates
    for (let i = 0; i < ship.length; i += 1) {
      const rowPlacement = direction === 'vertical' ? r + i : r
      const colPlacement = direction === 'horizontal' ? c + i : c
      // If that cell is full, the ship overlaps an existing ship
      if (this.grid[rowPlacement][colPlacement]) {
        throw new Error('Cell already occupied')
      }
      // Else set that cell to point to the ship
      this.grid[rowPlacement][colPlacement] = ship
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
    this.grid[r][c].hit()
  }

  areAllSunk() {
    // If any one cell in the grid is non-empty and non-hit, return false. Else, true
    return this.grid.every((rowArr, r) => rowArr.every((cell, c) => !cell || this.hits[r][c]))
  }
}

export default Gameboard
