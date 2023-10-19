function reconstructLoad(loadGameData, board1, board2, player1, player2, player1Ships, player2Ships) {
  // Take the retrieved save game JSON, and the newly created class instances
  // Combine them to return the game objects to the state they should be in

  // Firstly the boards and the players have their data set
  ;[
    [board1, loadGameData.boards.board1],
    [board2, loadGameData.boards.board2],
    [player1, loadGameData.players.player1],
    [player2, loadGameData.players.player2]
  ].forEach(([target, source]) => Object.assign(target, source))

  // Then each of the ships also has its data set in turn
  ;[
    [player1Ships, loadGameData.ships.player1Ships],
    [player2Ships, loadGameData.ships.player2Ships]
  ].forEach(([targetArr, sourceArr]) => {
    targetArr.forEach((_, ind) => Object.assign(targetArr[ind], sourceArr[ind]))
  })

  // Now to ensure the players' references to their boards point to the correct board,
  // And that the gameboards' references to their ships point to the correct ships,
  // We reconnect the objects making use of their unique IDs, which have also been retrieved
  ;[
    [board1, player1Ships],
    [board2, player2Ships]
  ].forEach(([board, playerShips]) => {
    board.grid.forEach((row) =>
      row.forEach((cell) => {
        if (!cell) return
        cell.ship = playerShips.find((ship) => ship.ID === cell.shipID)
      })
    )
  })
  ;[player1, player2].forEach((player) => {
    ;['home', 'enemy'].forEach((location) => {
      player[`${location}Board`] = [board1, board2].find((board) => board.ID === player[`${location}BoardID`])
    })
  })

  // Finally set and return any required gameplay variables
  const turnPlayer = [player1, player2].find((player) => player.ID === loadGameData.gameplay.turnPlayer.ID)
  const { turnCounter } = loadGameData.gameplay
  return { turnPlayer, turnCounter }
}

export default reconstructLoad
