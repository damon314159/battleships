import Ship from '../js/Ship'

describe('Ship class', () => {
  test('should initialize correctly', () => {
    const ship = new Ship(3)
    expect(ship.length).toBe(3)
    expect(ship.hits).toBe(0)
    expect(ship.isSunk).toBe(false)
  })

  test('should register hits', () => {
    const ship = new Ship(4)
    ship.hit()
    expect(ship.hits).toBe(1)
    ship.hit()
    expect(ship.hits).toBe(2)
  })

  test('should not be sunk initially', () => {
    const ship = new Ship(2)
    expect(ship.isSunk).toBe(false)
  })

  test('should not be sunk after some hits', () => {
    const ship = new Ship(3)
    ship.hit()
    ship.hit()
    expect(ship.isSunk).toBe(false)
  })

  test('should be sunk when hits reach length', () => {
    const ship = new Ship(3)
    ship.hit()
    ship.hit()
    ship.hit()
    expect(ship.isSunk).toBe(true)
  })
})
