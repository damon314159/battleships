import Player from './Player'
import Gameboard from './Gameboard'
import Ship from './Ship'
import helpersDOM from './helpersDOM'

// All pre-game setup and instantiation
function game(isVsComputer, loadGameData = null) {
  const homeWaters = document.getElementById('home-waters')
  const enemyWaters = document.getElementById('enemy-waters')

  const board1 = new Gameboard()
  const board2 = new Gameboard()
  const player1 = new Player(board1, board2, false)
  const player2 = new Player(board2, board1, isVsComputer)

  let turnPlayer = player1
  let turnCounter = 0

  if (loadGameData) {
    // TODO If storedData, enable load game button
    // take gameboard.hits/grid from local storage when load game,
    // to replace instantiated objects arrays with
  } else {
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
  }
  helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)

  // Function to wait for a click event on enemy waters
  function waitForClick() {
    return new Promise((resolve, reject) => {
      const clickHandler = (event) => {
        // Remove the event listener to avoid multiple resolutions
        enemyWaters.removeEventListener('click', clickHandler)
        resolve(event)
      }
      // Add the click listener to be waited on
      enemyWaters.addEventListener('click', clickHandler)

      // Add a way to interrupt the game-loop while async
      const newGameBtn = document.getElementById('newGameBtn')
      const interruptHandler = () => {
        newGameBtn.removeEventListener('click', interruptHandler)
        reject(new Error('Interrupt requested'))
      }
      newGameBtn.addEventListener('click', interruptHandler)
    })
  }

  // Turn by turn logic
  async function mainGameLoopIteration() {
    // Start of turn, player can now click a square to attack
    const event = await waitForClick()
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
    // TODO function to wait until handover button pressed
    turnPlayer = turnCounter % 2 ? player2 : player1
    helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
    return false
  }

  // Setup concluded, start the turns
  ;(async function mainGameLoop() {
    for (;;) {
      try {
        // Wait for each move before continuing
        // eslint-disable-next-line no-await-in-loop
        if (await mainGameLoopIteration()) break
        // Break on a true return, indicative of a winner
      } catch {
        // Loop interrupted
        break
      }
    }
  })()
}

export default game
