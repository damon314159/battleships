/* eslint-disable no-await-in-loop */
import Player from './Player'
import Gameboard from './Gameboard'
import Ship from './Ship'
import helpersDOM from './helpersDOM'
import reconstructLoad from './reconstructLoad'

// All pre-game setup and instantiation
async function game(isVsComputer, loadGameData = null) {
  // Target the waters of the DOM for rendering purposes
  const homeWaters = document.getElementById('home-waters')
  const enemyWaters = document.getElementById('enemy-waters')

  // Create all the required class instances for the game
  const board1 = new Gameboard()
  const board2 = new Gameboard()
  const player1 = new Player(board1, board2, false)
  const player2 = new Player(board2, board1, isVsComputer)

  const player1Ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)]
  const player2Ships = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)]

  let turnPlayer = player1
  let turnCounter = 0

  // Test to see if this is a new game or a loaded one
  if (loadGameData) {
    // Take game state objects from local storage when a game is loaded.
    // Then copy the data onto the new class instances.
    // Then return and set the gameplay variables via destructuring
    ;({ turnPlayer, turnCounter } = reconstructLoad(
      loadGameData,
      board1,
      board2,
      player1,
      player2,
      player1Ships,
      player2Ships
    ))
    if (turnCounter % 2) helpersDOM.toggleTurnIndicator()
  } else {
    // Else we are in a new game and the ship placement should begin
    await helpersDOM.openHandoverScreen(1000, 'Time for admiral 1 to organise their fleet!')
    // A brief pause and then loop through the ships for player 1 to place
    for (let i = 0; i < player1Ships.length; i += 1) {
      try {
        await helpersDOM.awaitValidPlacement(player1, player1Ships[i], homeWaters)
        helpersDOM.renderBoards(player1, homeWaters, enemyWaters)
      } catch {
        // If an interrupt is thrown, a new game has been started, so quit this game
        return
      }
    }
    if (player2.isAI) {
      // If this is single player mode, the computer will need to randomly place their ships
      for (let i = 0; i < player2Ships.length; ) {
        const direction = Math.floor(Math.random() * 2) ? 'vertical' : 'horizontal'
        // A simple random distribution from the rows and columns that would allow the ship to fit on the board
        // We do not address overlapping ships, since the probabilities are low and it is faster to try again
        // in the relatively uncommon case of an overlap
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
          // If the placement was invalid (due to an overlap), try again
        }
      }
    } else {
      // If this is a two player game, we now allow player 2 to do their own ship placements
      // These are exactly the same as those for player 1
      await helpersDOM.openHandoverScreen(2000, 'Time for admiral 2 to organise their fleet!')
      helpersDOM.toggleTurnIndicator()
      helpersDOM.renderBoards(player2, homeWaters, enemyWaters)

      for (let i = 0; i < player2Ships.length; i += 1) {
        try {
          await helpersDOM.awaitValidPlacement(player2, player2Ships[i], homeWaters)
          helpersDOM.renderBoards(player2, homeWaters, enemyWaters)
        } catch {
          // If an interrupt is thrown, a new game has been started, so quit this game
          return
        }
      }
      helpersDOM.toggleTurnIndicator()
    }
  }
  // Once all the ships are down, its time to pass back to player 1
  await helpersDOM.openHandoverScreen(2000, `Let the game begin! Admiral 1's turn`)

  // A final render, ready to start the game
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

    // If computer player, generate a move now
    if (player2.isAI) {
      // A brief pause to let the user observe the result of their own turn
      await new Promise((resolve) => {
        setTimeout(resolve, 2000)
      })
      // Send an attack
      player2.sendAttack()
      // Render the change
      helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
      if (turnPlayer.homeBoard.areAllSunk()) {
        // Break out of loop with a truthy return upon win condition
        return true
      }
      return false
    }

    // If 2 player mode, prepare for handover
    turnCounter += 1
    turnPlayer = turnCounter % 2 ? player2 : player1
    await helpersDOM.openHandoverScreen(2000, `Time for admiral ${turnCounter % 2 ? '2' : '1'}'s next move!`)
    helpersDOM.toggleTurnIndicator()
    helpersDOM.renderBoards(turnPlayer, homeWaters, enemyWaters)
    return false
  }

  function unloadHandler() {
    // If the user would exit out of the unfinished game, store the game state
    const gameState = {
      gameplay: {
        turnPlayer,
        turnCounter
      },
      boards: {
        board1,
        board2
      },
      players: {
        player1,
        player2
      },
      ships: {
        player1Ships,
        player2Ships
      }
    }
    localStorage.clear()
    localStorage.setItem('gameState', JSON.stringify(gameState))
  }

  // Attach the unload listener
  window.addEventListener('beforeunload', unloadHandler)

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

  // If the game has ended, remove the unload-save listener
  window.removeEventListener('beforeunload', unloadHandler)
}

export default game
