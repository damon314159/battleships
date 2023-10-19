/* eslint-disable no-await-in-loop */
const helpersDOM = {
  renderBoards: function renderBoards(turnPlayer, homeWaters, enemyWaters) {
    const homeBoardCells = homeWaters.querySelectorAll('.board>*')
    const enemyBoardCells = enemyWaters.querySelectorAll('.board>*')
    // Populate new boards
    homeBoardCells.forEach((cell) => {
      const [r, c] = helpersDOM.getCellCoordinates(cell)
      helpersDOM.markShip(cell, turnPlayer.homeBoard, r, c)
      helpersDOM.updateCellType(cell, turnPlayer.homeBoard, r, c)
    })
    enemyBoardCells.forEach((cell) => {
      const [r, c] = helpersDOM.getCellCoordinates(cell)
      helpersDOM.updateCellType(cell, turnPlayer.enemyBoard, r, c)
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

  createWaters: function createWaters(parentElement, size) {
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const cell = document.createElement('div')
        cell.classList.add('cell', 'empty')
        cell.dataset.r = r
        cell.dataset.c = c
        parentElement.appendChild(cell)
      }
    }
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
  },

  highlightShipPlacement: function highlightShipPlacement(event, player, ship) {
    if (!event.target.classList.contains('cell')) return
    const direction = event.shiftKey ? 'vertical' : 'horizontal'
    const [startRow, startCol] = helpersDOM.getCellCoordinates(event.target)

    const valid = player.homeBoard.isValidPlacement(ship, startRow, startCol, direction)

    for (let i = 0; i < ship.length; i += 1) {
      const r = direction === 'vertical' ? startRow + i : startRow
      const c = direction === 'horizontal' ? startCol + i : startCol
      const cell = helpersDOM.getCellElement(event.currentTarget.querySelector('.board'), r, c)
      if (!cell) return
      cell.classList.add(valid ? 'valid-place' : 'invalid-place')
    }
  },

  clearHighlight: function clearHighlight(event) {
    const cells = event.currentTarget.querySelectorAll('.cell.valid-place, .cell.invalid-place')
    cells.forEach((cell) => cell.classList.remove('valid-place', 'invalid-place'))
  },

  delegatePlaceClick: function delegatePlaceClick(event, player, ship) {
    if (!event.target.classList.contains('cell')) {
      return false
    }
    const direction = event.shiftKey ? 'vertical' : 'horizontal'
    const [r, c] = helpersDOM.getCellCoordinates(event.target)

    if (!player.homeBoard.isValidPlacement(ship, r, c, direction)) {
      return false
    }
    player.homeBoard.placeShip(ship, r, c, direction)
    return true
  },

  waitForPlacement: function waitForPlacement(homeWaters) {
    return new Promise((resolve) => {
      const clickHandler = (event) => {
        homeWaters.removeEventListener('click', clickHandler)
        resolve(event)
      }

      // Add the click listener to be waited on
      homeWaters.addEventListener('click', clickHandler)
    })
  },

  awaitValidPlacement: async function awaitValidPlacement(player, ship, homeWaters) {
    const hoverCallback = (event) => helpersDOM.highlightShipPlacement(event, player, ship)
    const unhoverCallback = (event) => helpersDOM.clearHighlight(event)
    homeWaters.addEventListener('mouseover', hoverCallback)
    homeWaters.addEventListener('mouseout', unhoverCallback)
    for (;;) {
      const event = await helpersDOM.waitForPlacement(homeWaters)
      // Break on true return, signify successful placement
      if (helpersDOM.delegatePlaceClick(event, player, ship)) {
        homeWaters.removeEventListener('mouseover', hoverCallback)
        homeWaters.removeEventListener('mouseover', unhoverCallback)
        break
      }
    }
  },

  waitForAttack: function waitForAttack(enemyWaters) {
    return new Promise((resolve, reject) => {
      const newGameBtn = document.getElementById('newGameBtn')

      const clickHandler = (event) => {
        // Remove the event listener to avoid multiple resolutions
        enemyWaters.removeEventListener('click', clickHandler)
        // eslint-disable-next-line no-use-before-define
        newGameBtn.removeEventListener('click', interruptHandler)
        resolve(event)
      }
      // Add a way to interrupt the game-loop while async
      const interruptHandler = () => {
        newGameBtn.removeEventListener('click', interruptHandler)
        enemyWaters.removeEventListener('click', clickHandler)

        reject(new Error('Interrupt requested'))
      }

      // Add the click listener to be waited on
      enemyWaters.addEventListener('click', clickHandler)
      newGameBtn.addEventListener('click', interruptHandler)
    })
  }
}

export default helpersDOM
