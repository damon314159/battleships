function reconstructLoad(loadGameData, board1, board2, player1, player2, player1Ships, player2Ships) {
  // const gameState = {
  //   gameplay: {
  //     turnPlayer,
  //     turnCounter
  //   },
  //   boards: {
  //     board1,
  //     board2
  //   },
  //   players: {
  //     player1,
  //     player2
  //   },
  //   ships: {
  //     player1Ships,
  //     player2Ships
  //   }
  // }
  ;[
    [board1, loadGameData.boards.board1],
    [board2, loadGameData.boards.board2],
    [player1, loadGameData.players.player1],
    [player2, loadGameData.players.player2]
  ].forEach(([target, source]) => Object.assign(target, source))
  ;[
    [player1Ships, loadGameData.ships.player1Ships],
    [player2Ships, loadGameData.ships.player2Ships]
  ].forEach(([targetArr, sourceArr]) => {
    targetArr.forEach((_, ind) => Object.assign(targetArr[ind], sourceArr[ind]))
  })

  // Reconnect appropriate objects via IDs
  // Boards point to Ships
  // Players point to Boards
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

  const turnPlayer = [player1, player2].find((player) => player.ID === loadGameData.gameplay.turnPlayer.ID)
  const { turnCounter } = loadGameData.gameplay
  return { turnPlayer, turnCounter }
}

export default reconstructLoad
