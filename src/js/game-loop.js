import Player from './Player'
import Gameboard from './Gameboard'
import Ship from './Ship'
import helpersDOM from './helpersDOM'

const playerWaters = document.getElementById('player-waters')
const enemyWaters = document.getElementById('enemy-waters')

// All pre-game setup and instantiation
function game() {
  // TODO local storage for an existing game
  const board1 = new Gameboard()
  const board2 = new Gameboard()
  const { size } = Gameboard
  const player1 = (() => ({
    playerInstance: new Player(board1, board2),
    homeWater: helpersDOM.createWaters(size),
    enemyWater: helpersDOM.createWaters(size),
    homeBoard: board1,
    enemyBoard: board2
  }))()
  const player2 = (() => ({
    playerInstance: new Player(board2, board1, false),
    homeWater: helpersDOM.createWaters(size),
    enemyWater: helpersDOM.createWaters(size),
    homeBoard: board2,
    enemyBoard: board1
  }))()

  // TODO Temporary until manual placing implemented
  player1.homeBoard.placeShip(new Ship(5), 0, 0, 'horizontal')
  player1.homeBoard.placeShip(new Ship(4), 1, 1, 'horizontal')
  player1.homeBoard.placeShip(new Ship(3), 2, 2, 'horizontal')
  player1.homeBoard.placeShip(new Ship(3), 3, 3, 'horizontal')
  player1.homeBoard.placeShip(new Ship(2), 4, 4, 'horizontal')
  player2.homeBoard.placeShip(new Ship(5), 4, 4, 'vertical')
  player2.homeBoard.placeShip(new Ship(4), 5, 5, 'vertical')
  player2.homeBoard.placeShip(new Ship(3), 6, 6, 'vertical')
  player2.homeBoard.placeShip(new Ship(3), 7, 7, 'vertical')
  player2.homeBoard.placeShip(new Ship(2), 8, 8, 'vertical')
  // ^^^ Temporary until manual placing implemented ^^^

  // Function to wait for a click event on enemy waters
  function waitForClick() {
    return new Promise((resolve) => {
      const clickHandler = (event) => {
        // Remove the event listener to avoid multiple resolutions
        enemyWaters.removeEventListener('click', clickHandler)
        resolve(event)
      }
      // Add the click listener to be waited on
      enemyWaters.addEventListener('click', clickHandler)
    })
  }

  let turnPlayer = player1
  let turnCounter = 0
  helpersDOM.renderBoards(turnPlayer, playerWaters, enemyWaters)

  // Turn by turn logic
  async function mainGameLoopIteration() {
    // Start of turn, player can now click a square to attack
    const event = await waitForClick()
    // Wait for the click event
    try {
      helpersDOM.delegateAttackClick(event, turnPlayer)
      helpersDOM.renderBoards(turnPlayer, playerWaters, enemyWaters)
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
    if (player2.playerInstance.isAI) {
      // Send an attack
      player2.playerInstance.sendAttack()
      // Render the change
      helpersDOM.renderBoards(turnPlayer, playerWaters, enemyWaters)
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
    // TODO function to wait until handover button pressed
    turnPlayer = turnCounter % 2 ? player2 : player1
    helpersDOM.renderBoards(turnPlayer, playerWaters, enemyWaters)
    return false
  }

  // Setup concluded, start the turns
  ;(async function mainGameLoop() {
    for (;;) {
      // Wait for each move before continuing
      // eslint-disable-next-line no-await-in-loop
      if (await mainGameLoopIteration()) break
      // Break on a true return, indicative of a winner
    }
  })()
}

export default game
