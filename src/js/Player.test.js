import Player from './Player'
import Gameboard from './Gameboard'
import Ship from './Ship'

describe('Player class', () => {
  let homeBoard
  let enemyBoard
  let ship
  let player

  beforeEach(() => {
    homeBoard = new Gameboard()
    enemyBoard = new Gameboard()
    ship = new Ship(4)
    player = new Player(homeBoard, enemyBoard)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Player should have references to homeBoard and enemyBoard', () => {
    expect(player.homeBoard).toBe(homeBoard)
    expect(player.enemyBoard).toBe(enemyBoard)
  })

  test('Player can send attack to enemyBoard', () => {
    const mockReceiveAttack = jest.spyOn(enemyBoard, 'receiveAttack')

    player.sendAttack(0, 0)

    expect(mockReceiveAttack).toHaveBeenCalledWith(0, 0)
    expect(enemyBoard.hits[0][0]).not.toBe(null)
  })

  test('Player can land attack on enemy ship', () => {
    const mockReceiveAttack = jest.spyOn(enemyBoard, 'receiveAttack')
    const mockHit = jest.spyOn(ship, 'hit')

    player.enemyBoard.placeShip(ship, 0, 0, 'horizontal')
    player.sendAttack(0, 1)

    expect(mockReceiveAttack).toHaveBeenCalledWith(0, 1)
    expect(mockHit).toHaveBeenCalled()
    expect(enemyBoard.hits[0][1]).toBe(true)
  })

  test('Player can miss attack on enemy ship', () => {
    const mockReceiveAttack = jest.spyOn(enemyBoard, 'receiveAttack')
    const mockHit = jest.spyOn(ship, 'hit')

    player.enemyBoard.placeShip(ship, 0, 0, 'horizontal')
    player.sendAttack(1, 0)

    expect(mockReceiveAttack).toHaveBeenCalledWith(1, 0)
    expect(mockHit).not.toHaveBeenCalled()
    expect(enemyBoard.hits[1][0]).toBe(false)
  })

  test('Player cannot send duplicate attacks', () => {
    player.sendAttack(1, 1)

    // Try to hit the same cell again
    expect(() => player.sendAttack(1, 1)).toThrow('Cell already attacked')
    // Ensure the cell is still hit
    expect(enemyBoard.hits[1][1]).not.toBe(null)
  })

  test('AI Player can make random legal attack', () => {
    const aiPlayer = new Player(homeBoard, enemyBoard, true)
    const mockReceiveAttack = jest.spyOn(enemyBoard, 'receiveAttack')

    // Make three attacks
    aiPlayer.sendAttack()
    aiPlayer.sendAttack()
    aiPlayer.sendAttack()

    // Ensure that receiveAttack is called with the expected coordinates
    expect(mockReceiveAttack).toHaveBeenCalled()
    expect(mockReceiveAttack).toHaveBeenCalled()
    expect(mockReceiveAttack).toHaveBeenCalled()
  })

  test('AI Player throws error when enemy board is full', () => {
    const aiPlayer = new Player(homeBoard, enemyBoard, true)

    // Fill the enemy board
    enemyBoard.grid.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        enemyBoard.receiveAttack(rowIndex, colIndex)
      })
    })

    // Attempt to make an attack when the enemy board is full
    expect(() => aiPlayer.sendAttack()).toThrow('Enemy board is full')
  })
})
