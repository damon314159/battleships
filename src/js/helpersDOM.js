const helpersDOM = {
  renderBoards: function renderBoards(turnPlayer, playerWaters, enemyWaters) {
    const playerBoard = playerWaters.querySelector('.board')
    const enemyBoard = enemyWaters.querySelector('.board')
    // Clear existing boards if any
    while (playerBoard.firstChild) {
      playerBoard.removeChild(playerBoard.firstChild)
    }
    while (enemyBoard.firstChild) {
      enemyBoard.removeChild(enemyBoard.firstChild)
    }
    // Populate new boards
    turnPlayer.homeWater.forEach((cell) => {
      const [r, c] = helpersDOM.getCellCoordinates(cell)
      helpersDOM.markShip(cell, turnPlayer.homeBoard, r, c)
      helpersDOM.updateCellType(cell, turnPlayer.homeBoard, r, c)
      playerBoard.appendChild(cell)
    })
    turnPlayer.enemyWater.forEach((cell) => {
      const [r, c] = helpersDOM.getCellCoordinates(cell)
      helpersDOM.updateCellType(cell, turnPlayer.enemyBoard, r, c)
      enemyBoard.appendChild(cell)
    })
  },

  delegateAttackClick: function delegateAttackClick(event, turnPlayer) {
    if (!event.target.classList.contains('cell')) {
      throw new Error('Click was not on a cell')
    }
    // Retrieve coordinates from node data
    const [r, c] = helpersDOM.getCellCoordinates(event.target)
    if (turnPlayer.enemyBoard.hits[r][c] !== null) {
      throw new Error('Cell already attacked')
    }
    turnPlayer.enemyBoard.receiveAttack(r, c)
  },

  createWaters: function createWaters(size) {
    const cells = []
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const cell = document.createElement('div')
        cell.classList.add('cell', 'empty')
        cell.dataset.r = r
        cell.dataset.c = c
        cells.push(cell)
      }
    }
    return cells
  },

  toggleTurnIndicator: function toggleTurnIndicator() {
    document.querySelectorAll('.turn-indicator').forEach((el) => {
      el.classList.toggle('hidden')
    })
  },

  markShip: function markShip(cell, gameboard, r, c) {
    cell.classList.remove('ship')
    if (gameboard.grid[r][c]) {
      cell.classList.add('ship')
    }
  },

  updateCellType: function updateCellType(cell, gameboard, r, c) {
    // Retrieve state
    const cellState = gameboard.hits[r][c]
    // Remove any current cell type class
    cell.classList.remove('empty', 'hit', 'miss')
    // Apply styling based on the cell state
    switch (cellState) {
      case null:
        cell.classList.add('empty')
        break
      case true:
        cell.classList.add('hit')
        break
      case false:
        cell.classList.add('miss')
        break
      default:
        break
    }
  },

  getCellCoordinates: function getCellCoordinates(cellElement) {
    const r = parseInt(cellElement.dataset.r, 10)
    const c = parseInt(cellElement.dataset.c, 10)
    return [r, c]
  },

  getCellElement: function getCellElement(parentElement, r, c) {
    const cellSelector = `.cell[data-r="${r}"][data-c="${c}"]`
    return parentElement.querySelector(cellSelector)
  }
}

export default helpersDOM
