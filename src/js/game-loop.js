/* eslint-disable no-await-in-loop */
import Player from './Player'
import Gameboard from './Gameboard'
import Ship from './Ship'
import helpersDOM from './helpersDOM'

// All pre-game setup and instantiation
async function game(isVsComputer, loadGameData = null) {
  const homeWaters = document.getElementById('home-waters')
  const enemyWaters = document.getElementById('enemy-waters')

  const board1 = new Gameboard()
  const board2 = new Gameboard()
  const player1 = new Player(board1, board2, false)
  const player2 = new Player(board2, board1, isVsComputer)

  let turnPlayer = player1
  let turnCounter = 0

  async function awaitValidPlacement(player, ship) {
    for (;;) {
      const hoverCallback = (event) => helpersDOM.highlightShipPlacement(event, player, ship)
      const unhoverCallback = (event) => helpersDOM.clearHighlight(event)
      homeWaters.addEventListener('mouseover', hoverCallback)
      homeWaters.addEventListener('mouseout', unhoverCallback)
      const event = await helpersDOM.waitForPlacement(homeWaters)
      // Break on true return, signify successful placement
      if (helpersDOM.delegatePlaceClick(event, player, ship)) {
        homeWaters.removeEventListener('mouseover', hoverCallback)
        homeWaters.removeEventListener('mouseover', unhoverCallback)
        break
      }
    }
  }
  const player1Ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)]
  const player2Ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)]

  if (loadGameData) {
    // TODO If storedData, enable load game button
    // take gameboard.hits/grid from local storage when load game,
    // to replace instantiated objects arrays with
  } else {
    for (let i = 0; i < player1Ships.length; i += 1) {
      await awaitValidPlacement(player1, player1Ships[i])
      helpersDOM.renderBoards(player1, homeWaters, enemyWaters)
    }
    if (player2.isAI) {
      // Simple random placement
      for (let i = 0; i < player2Ships.length; ) {
        const direction = Math.floor(Math.random() * 2) ? 'vertical' : 'horizontal'
        const r = Math.floor(
          Math.random() * (direction === 'vertical' ? Gameboard.size + 1 - player2Ships[i].length : Gameboard.size)
        )
        const c = Math.floor(
          Math.random() * (direction === 'horizontal' ? Gameboard.size + 1 - player2Ships[i].length : Gameboard.size)
        )
        try {
          player2.homeBoard.placeShip(player2Ships[i], r, c, direction)
          // If placement successful, increment the loop counter to the next ship
          i += 1
        } catch {
          // If the placement was invalid, try again
        }
      }
    } else {
      // TODO Handover screen
      helpersDOM.renderBoards(player2, homeWaters, enemyWaters)
      for (let i = 0; i < player2Ships.length; i += 1) {
        await awaitValidPlacement(player2, player2Ships[i])
        helpersDOM.renderBoards(player2, homeWaters, enemyWaters)
      }
      // TODO Handover screen
    }
  }
  helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)

  // Turn by turn logic
  async function mainGameLoopIteration() {
    // Start of turn, player can now click a square to attack
    const event = await helpersDOM.waitForAttack(enemyWaters)
    // Wait for the click event
    try {
      helpersDOM.delegateAttackClick(event, turnPlayer)
      helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
      if (turnPlayer.enemyBoard.areAllSunk()) {
        // Break out of loop with a truthy return upon win condition
        return true
      }
    } catch {
      // If the move was invalid, cancel the current iteration
      // Then a new click can be waited for without changing player
      return false
    }
    // Update turn counter and toggle indicators
    helpersDOM.toggleTurnIndicator()
    turnCounter += 1

    // If computer player, generate a move now
    if (player2.isAI) {
      // Send an attack
      player2.sendAttack()
      // Render the change
      helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
      // Update turn counter and toggle indicators
      helpersDOM.toggleTurnIndicator()
      turnCounter += 1
      if (turnPlayer.homeBoard.areAllSunk()) {
        // Break out of loop with a truthy return upon win condition
        return true
      }
      return false
    }

    // If 2 player mode, prepare for handover
    // TODO Handover screen
    turnPlayer = turnCounter % 2 ? player2 : player1
    helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
    return false
  }

  // Setup concluded, start the turns
  for (;;) {
    try {
      // Wait for each move before continuing
      if (await mainGameLoopIteration()) break
      // Break on a true return, indicative of a winner
    } catch {
      // Loop interrupted
      break
    }
  }
}

export default game
