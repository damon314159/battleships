/* eslint-disable no-await-in-loop */
const helpersDOM = {
  // Render the gameboards that should be visible onto the DOM waters
  renderBoards: function renderBoards(turnPlayer, homeWaters, enemyWaters) {
    const homeBoardCells = homeWaters.querySelectorAll('.board>*')
    const enemyBoardCells = enemyWaters.querySelectorAll('.board>*')

    // Populate the board cells with the appropriate classes for their state
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

  // Show blank copies of the grids to hide information while switching players
  renderBlankBoards: function renderBlankBoards() {
    const cells = document.querySelectorAll('.board>*')
    // Remove any classes that would visually giveaway information
    cells.forEach((cell) => {
      cell.classList.remove('ship', 'hit', 'miss')
      cell.classList.add('cell', 'empty')
    })
  },

  // Take the event from anywhere on the enemy waters,
  // and delegate that event to the appropriate cell
  delegateAttackClick: function delegateAttackClick(event, turnPlayer) {
    if (!event.target.classList.contains('cell')) {
      throw new Error('Click was not on a cell')
    }
    // Retrieve coordinates from node data
    const [r, c] = helpersDOM.getCellCoordinates(event.target)
    if (turnPlayer.enemyBoard.hits[r][c] !== null) {
      throw new Error('Cell already attacked')
    }
    // Providing the click was on a cell and that cell was yet to be attacked,
    // call the method to make that attack
    turnPlayer.enemyBoard.receiveAttack(r, c)
  },

  // Simple loop to generate the cell divs
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

  // Apply the ship class to a cell if it contains a reference to a ship object
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

  // Two helpers to turn a cell element into its coordinates and vice versa
  getCellCoordinates: function getCellCoordinates(cellElement) {
    const r = parseInt(cellElement.dataset.r, 10)
    const c = parseInt(cellElement.dataset.c, 10)
    return [r, c]
  },

  getCellElement: function getCellElement(parentElement, r, c) {
    const cellSelector = `.cell[data-r="${r}"][data-c="${c}"]`
    return parentElement.querySelector(cellSelector)
  },

  // While the user is placing their ships, highlight all the cells the ship would occupy
  // as the user hovers their mouse over various points of their waters
  highlightShipPlacement: function highlightShipPlacement(event, player, ship) {
    if (!event.target.classList.contains('cell')) return
    // Shift key is used to determine the direction of the ship placement
    const direction = event.shiftKey ? 'vertical' : 'horizontal'
    const [startRow, startCol] = helpersDOM.getCellCoordinates(event.target)

    // Test validity if the ship were to be placed in this location
    const valid = player.homeBoard.isValidPlacement(ship, startRow, startCol, direction)

    // For each cell that the ship would occupy, colour it according to the previous validity
    for (let i = 0; i < ship.length; i += 1) {
      const r = direction === 'vertical' ? startRow + i : startRow
      const c = direction === 'horizontal' ? startCol + i : startCol
      const cell = helpersDOM.getCellElement(event.currentTarget.querySelector('.board'), r, c)
      if (!cell) return
      cell.classList.add(valid ? 'valid-place' : 'invalid-place')
    }
  },

  // Remove the highlighting from the previous function as required
  clearHighlight: function clearHighlight(event) {
    const cells = event.currentTarget.querySelectorAll('.cell.valid-place, .cell.invalid-place')
    cells.forEach((cell) => cell.classList.remove('valid-place', 'invalid-place'))
  },

  // Take the event from anywhere on the home waters,
  // and delegate that event to the appropriate cell
  delegatePlaceClick: function delegatePlaceClick(event, player, ship) {
    if (!event.target.classList.contains('cell')) {
      return false
    }
    // Place the ship according to the event target's coordinates and shift key direction
    const direction = event.shiftKey ? 'vertical' : 'horizontal'
    const [r, c] = helpersDOM.getCellCoordinates(event.target)

    // If it would be invalid, return false and do not place
    if (!player.homeBoard.isValidPlacement(ship, r, c, direction)) {
      return false
    }
    // Else place the ship and return true to signal success
    player.homeBoard.placeShip(ship, r, c, direction)
    return true
  },

  // Create a promise for a click event when placing ships on home waters
  waitForPlacement: function waitForPlacement(homeWaters) {
    return new Promise((resolve, reject) => {
      const newGameBtn = document.getElementById('new-game-btn')
      const clickHandler = (event) => {
        // The promise will only be resolved when the handler is triggered
        homeWaters.removeEventListener('click', clickHandler)
        // eslint-disable-next-line no-use-before-define
        newGameBtn.removeEventListener('click', interruptHandler)
        resolve(event)
      }

      // Add a way to interrupt the game-loop while async
      // This is required if a new game were to be started,
      // such that the old one can be cancelled
      const interruptHandler = () => {
        newGameBtn.removeEventListener('click', interruptHandler)
        homeWaters.removeEventListener('click', clickHandler)

        reject(new Error('Interrupt requested'))
      }

      // Add the click listener to be waited on
      homeWaters.addEventListener('click', clickHandler)
      newGameBtn.addEventListener('click', interruptHandler)
    })
  },

  // Placement flow control
  // Ensures highlighting, waiting for clicks, and event delegation happen in order
  awaitValidPlacement: async function awaitValidPlacement(player, ship, homeWaters) {
    // Attach the hover highlighting listeners
    const hoverCallback = (event) => helpersDOM.highlightShipPlacement(event, player, ship)
    const unhoverCallback = (event) => helpersDOM.clearHighlight(event)
    homeWaters.addEventListener('mouseover', hoverCallback)
    homeWaters.addEventListener('mouseout', unhoverCallback)
    // Infinite loop so that unsuccessful placement clicks can be reattempted
    for (;;) {
      try {
        const event = await helpersDOM.waitForPlacement(homeWaters)
        if (helpersDOM.delegatePlaceClick(event, player, ship)) {
          // Break on true return, signifying a successful placement
          homeWaters.removeEventListener('mouseover', hoverCallback)
          homeWaters.removeEventListener('mouseover', unhoverCallback)
          break
        }
      } catch (error) {
        // If the loop was interrupted by a new game start, remove the hover effects
        homeWaters.removeEventListener('mouseover', hoverCallback)
        homeWaters.removeEventListener('mouseover', unhoverCallback)
        // Then pass the error back to the game-loop so it can cancel the old game
        throw error
      }
    }
  },

  // Create a promise for a click event when attacking enemy waters
  waitForAttack: function waitForAttack(enemyWaters) {
    return new Promise((resolve, reject) => {
      const newGameBtn = document.getElementById('new-game-btn')

      const clickHandler = (event) => {
        // Remove the event listener to avoid multiple resolutions
        enemyWaters.removeEventListener('click', clickHandler)
        // eslint-disable-next-line no-use-before-define
        newGameBtn.removeEventListener('click', interruptHandler)
        resolve(event)
      }
      // Add a way to interrupt the game-loop while async
      // This is required if a new game were to be started,
      // such that the old one can be cancelled
      const interruptHandler = () => {
        newGameBtn.removeEventListener('click', interruptHandler)
        enemyWaters.removeEventListener('click', clickHandler)

        reject(new Error('Interrupt requested'))
      }

      // Add the click listener to be waited on
      enemyWaters.addEventListener('click', clickHandler)
      newGameBtn.addEventListener('click', interruptHandler)
    })
  },

  // Create a screen to tell the users when to pass the device in two player mode
  // Includes a backdrop to obfuscate the state of the game during handover
  openHandoverScreen: async function openHandoverScreen(delay, message) {
    // A small pause to allow the outgoing player to see the results of their move
    await new Promise((resolve) => {
      setTimeout(resolve, delay)
    })

    // Hide any sensitive game info - tactics beware!
    helpersDOM.renderBlankBoards()

    // Create the screen itself
    const wrapper = document.createElement('div')
    wrapper.classList.add('handover-wrapper')
    const handover = document.createElement('div')
    handover.classList.add('handover-modal')

    // Create the message element with close button
    const messageElement = document.createElement('p')
    messageElement.classList.add('handover-message')
    messageElement.innerText = message
    const btn = document.createElement('button')
    btn.classList.add('handover-button')
    btn.innerText = 'Click to continue'

    // Attach it all to the DOM
    handover.appendChild(messageElement)
    handover.appendChild(btn)
    wrapper.appendChild(handover)
    document.body.appendChild(wrapper)

    // A promise to close the screen when the button is clicked
    // This is so that the game can be made to wait in the background
    return new Promise((resolve) => {
      btn.addEventListener('click', () => {
        wrapper.remove()
        resolve()
      })
    })
  }
}

export default helpersDOM
