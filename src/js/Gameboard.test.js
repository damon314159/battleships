import Gameboard from './Gameboard'
import Ship from './Ship'

describe('Gameboard class', () => {
  let gameboard
  let ship1
  let ship2

  beforeEach(() => {
    gameboard = new Gameboard()
    ship1 = new Ship(3)
    ship2 = new Ship(2)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Place multiple ships at specific coordinates', () => {
    gameboard.placeShip(ship1, 0, 0, 'horizontal')
    gameboard.placeShip(ship2, 1, 0, 'vertical')

    // Check ship1 placement
    for (let i = 0; i < ship1.length; i += 1) {
      expect(gameboard.grid[0][i]).toBe(ship1)
    }

    // Check ship2 placement
    for (let i = 0; i < ship2.length; i += 1) {
      expect(gameboard.grid[i + 1][0]).toBe(ship2)
    }
  })

  test('Attempt to place overlapping ships with multiple ships', () => {
    gameboard.placeShip(ship1, 1, 0, 'horizontal')
    const overlappingShip = new Ship(2)
    expect(() => gameboard.placeShip(overlappingShip, 0, 1, 'vertical')).toThrow()
  })

  test('Receive and handle a successful attack on multiple ships', () => {
    gameboard.placeShip(ship1, 0, 0, 'horizontal')
    const ship1Spy = jest.spyOn(ship1, 'hit')
    gameboard.placeShip(ship2, 1, 0, 'vertical')
    const ship2Spy = jest.spyOn(ship2, 'hit')

    gameboard.receiveAttack(0, 1) // Hit ship1
    expect(ship1Spy).toHaveBeenCalled()
    expect(gameboard.hits[0][1]).toBe(true)

    gameboard.receiveAttack(1, 0) // Hit ship2
    expect(ship2Spy).toHaveBeenCalled()
    expect(gameboard.hits[0][1]).toBe(true) // ship1 still hit
    expect(gameboard.hits[1][0]).toBe(true)
  })

  test('Receive and handle a missed attack on multiple ships', () => {
    gameboard.placeShip(ship1, 0, 0, 'horizontal')
    const ship1Spy = jest.spyOn(ship1, 'hit')
    gameboard.placeShip(ship2, 1, 0, 'vertical')
    const ship2Spy = jest.spyOn(ship2, 'hit')

    gameboard.receiveAttack(1, 1) // Missed attack, no ship hit
    expect(ship1Spy).not.toHaveBeenCalled()
    expect(gameboard.hits[1][1]).toBe(false) // Miss

    gameboard.receiveAttack(3, 0) // Missed attack, no ship hit
    expect(ship2Spy).not.toHaveBeenCalled()
    expect(gameboard.hits[3][0]).toBe(false) // Miss
  })

  test('Report whether all ships are sunk with multiple ships', () => {
    gameboard.placeShip(ship1, 0, 0, 'horizontal')
    gameboard.placeShip(ship2, 1, 0, 'vertical')

    gameboard.receiveAttack(0, 0)
    gameboard.receiveAttack(0, 1)
    gameboard.receiveAttack(0, 2)

    gameboard.receiveAttack(1, 0)
    gameboard.receiveAttack(2, 0)

    expect(gameboard.areAllSunk()).toBe(true)
  })

  test('Report that not all ships are sunk with multiple ships', () => {
    gameboard.placeShip(ship1, 0, 0, 'horizontal')
    gameboard.placeShip(ship2, 1, 0, 'vertical')

    gameboard.receiveAttack(0, 0)
    gameboard.receiveAttack(0, 1)
    gameboard.receiveAttack(0, 2)

    gameboard.receiveAttack(1, 0)

    expect(gameboard.areAllSunk()).toBe(false)
  })
})
