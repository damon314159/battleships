import helpersDOM from '../js/helpersDOM'
import Gameboard from '../js/Gameboard'
import Ship from '../js/Ship'

describe('helpersDOM module', () => {
  let gameboard
  let playerGameboard
  let enemyGameboard
  let playerWaters
  let enemyWaters
  let player

  beforeEach(() => {
    gameboard = new Gameboard()
    // Mock the hits array
    gameboard.hits = [
      [null, true, false],
      [true, false, null],
      [false, null, true]
    ]
    playerGameboard = new Gameboard()
    enemyGameboard = new Gameboard()
    playerWaters = document.createElement('div')
    enemyWaters = document.createElement('div')
    const playerBoardDiv = document.createElement('div')
    const enemyBoardDiv = document.createElement('div')
    playerBoardDiv.classList.add('board')
    enemyBoardDiv.classList.add('board')
    playerWaters.appendChild(playerBoardDiv)
    enemyWaters.appendChild(enemyBoardDiv)
    player = {
      homeBoard: playerGameboard,
      enemyBoard: enemyGameboard,
      homeWater: helpersDOM.createWaters(Gameboard.size),
      enemyWater: helpersDOM.createWaters(Gameboard.size)
    }
  })

  test('createWaters should create a grid of empty cells', () => {
    const size = 3
    const cells = helpersDOM.createWaters(size)

    expect(cells.length).toBe(size * size)
    cells.forEach((cell) => {
      expect(cell.classList.contains('empty')).toBe(true)
    })
  })

  test('updateCellType should update the cell styling based on gameboard state', () => {
    const [r, c] = [1, 1]

    const cell = document.createElement('div')
    cell.classList.add('cell')
    cell.dataset.r = r
    cell.dataset.c = c

    helpersDOM.updateCellType(cell, gameboard, r, c)

    expect(cell.classList.contains('miss')).toBe(true)
  })

  test('delegateAttackClick should call receiveAttack on the gameboard', () => {
    const cell = document.createElement('div')
    document.body.appendChild(cell)

    const turnPlayer = {
      enemyBoard: gameboard
    }
    const event = {
      target: cell
    }
    event.target.classList.add('cell')
    event.target.dataset.r = 1
    event.target.dataset.c = 2
    const mockReceiveAttack = jest.spyOn(gameboard, 'receiveAttack')

    helpersDOM.delegateAttackClick(event, turnPlayer)
    expect(mockReceiveAttack).toHaveBeenCalledWith(1, 2)

    document.body.removeChild(cell)
  })

  test('getCellCoordinates should return the correct coordinates from a cell element', () => {
    const cellElement = document.createElement('div')
    cellElement.dataset.r = 2
    cellElement.dataset.c = 0

    const [r, c] = helpersDOM.getCellCoordinates(cellElement)

    expect(r).toBe(2)
    expect(c).toBe(0)
  })

  test('getCellElement should return the correct cell element from parentElement', () => {
    const parentElement = document.createElement('div')
    document.body.appendChild(parentElement)
    const [r, c] = [1, 2]

    const cellElement = document.createElement('div')
    cellElement.classList.add('cell')
    cellElement.dataset.r = r
    cellElement.dataset.c = c
    parentElement.appendChild(cellElement)

    const resultCellElement = helpersDOM.getCellElement(parentElement, r, c)

    expect(resultCellElement.dataset.r).toBe('1')
    expect(resultCellElement.dataset.c).toBe('2')
  })

  test('createWaters should handle a size of 1', () => {
    const size = 1
    const cells = helpersDOM.createWaters(size)

    expect(cells.length).toBe(1)
    expect(cells[0].classList.contains('empty')).toBe(true)
  })

  test('updateCellType should handle a null cell state', () => {
    const [r, c] = [0, 0]

    const cell = document.createElement('div')
    cell.classList.add('cell')
    cell.dataset.r = r
    cell.dataset.c = c

    helpersDOM.updateCellType(cell, gameboard, r, c)

    expect(cell.classList.contains('empty')).toBe(true)
  })

  test('markShip should add "ship" class for a ship cell', () => {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    const [r, c] = [0, 0]
    gameboard.placeShip(new Ship(3), r, c, 'horizontal')

    helpersDOM.markShip(cell, gameboard, r, c)

    expect(cell.classList.contains('ship')).toBe(true)
  })

  test('markShip should add "ship" class for a ship cell', () => {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    const [r, c] = [0, 0]
    gameboard.placeShip(new Ship(3), r, c, 'horizontal')

    helpersDOM.markShip(cell, gameboard, r, c)

    expect(cell.classList.contains('ship')).toBe(true)
  })

  test('toggleTurnIndicator should toggle the "hidden" class for turn indicators', () => {
    const indicator1 = document.createElement('div')
    indicator1.classList.add('turn-indicator')
    const indicator2 = document.createElement('div')
    indicator2.classList.add('turn-indicator', 'hidden')

    document.body.appendChild(indicator1)
    document.body.appendChild(indicator2)

    helpersDOM.toggleTurnIndicator()

    expect(indicator1.classList.contains('hidden')).toBe(true)
    expect(indicator2.classList.contains('hidden')).toBe(false)

    document.body.removeChild(indicator1)
    document.body.removeChild(indicator2)
  })

  test('renderBoards should render empty boards correctly', () => {
    helpersDOM.renderBoards(player, playerWaters, enemyWaters)

    const playerCells = playerWaters.querySelectorAll('.cell')
    const enemyCells = enemyWaters.querySelectorAll('.cell')

    expect(playerCells.length).toBe(Gameboard.size ** 2)
    expect(enemyCells.length).toBe(Gameboard.size ** 2)

    playerCells.forEach((cell) => {
      expect(cell.classList.contains('empty')).toBe(true)
    })

    enemyCells.forEach((cell) => {
      expect(cell.classList.contains('empty')).toBe(true)
    })
  })

  test('renderBoards should render player board with ships and enemy board without revealing ships', () => {
    playerGameboard.placeShip(new Ship(3), 0, 0, 'horizontal')
    playerGameboard.placeShip(new Ship(4), 2, 3, 'vertical')
    playerGameboard.receiveAttack(0, 0)

    helpersDOM.renderBoards(player, playerWaters, enemyWaters)

    const playerCells = playerWaters.querySelectorAll('.cell')
    const enemyCells = enemyWaters.querySelectorAll('.cell')

    expect(playerCells[0].classList.contains('ship')).toBe(true)
    expect(playerCells[1].classList.contains('ship')).toBe(true)
    expect(playerCells[2].classList.contains('ship')).toBe(true)

    expect(playerCells[0].classList.contains('hit')).toBe(true)

    enemyCells.forEach((cell) => {
      expect(cell.classList.contains('empty')).toBe(true)
      expect(cell.classList.contains('hit')).toBe(false)
      expect(cell.classList.contains('miss')).toBe(false)
      expect(cell.classList.contains('ship')).toBe(false)
    })
  })
})
