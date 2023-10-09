import { v4 as uniqueID } from 'uuid'

class Player {
  constructor(homeBoard, enemyBoard, isAI, ID = uniqueID()) {
    this.ID = ID
    // Give each player references to their board and opponent's board
    this.homeBoard = homeBoard
    this.homeBoardID = homeBoard.ID
    this.enemyBoard = enemyBoard
    this.enemyBoardID = enemyBoard.ID
    this.isAI = isAI
  }

  #decideAIMove() {
    // Collect the coordinates of all null entries for valid moves
    const nullEntries = []
    this.enemyBoard.hits.forEach((row, rowIndex) => {
      row.forEach((entry, colIndex) => {
        if (entry === null) {
          nullEntries.push([rowIndex, colIndex])
        }
      })
    })
    // Check if there are any null entries
    if (nullEntries.length === 0) {
      throw new Error('Enemy board is full')
    }
    // Randomly choose one null entry
    const randomIndex = Math.floor(Math.random() * nullEntries.length)
    // Return that entry's [r,c] coordinates in array form
    return nullEntries[randomIndex]
  }

  sendAttack(chosenRow, chosenCol) {
    // Choose AI move if player is computer
    const [r, c] = this.isAI ? this.#decideAIMove() : [chosenRow, chosenCol]
    if (this.enemyBoard.hits[r][c] !== null) {
      // Don't allow duplicate hits
      throw new Error('Cell already attacked')
    }
    this.enemyBoard.receiveAttack(r, c)
    return [r, c]
  }
}

export default Player
