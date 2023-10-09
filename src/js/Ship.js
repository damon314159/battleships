import { v4 as uniqueID } from 'uuid'

class Ship {
  constructor(length, ID = uniqueID()) {
    this.ID = ID
    this.length = length
    this.hits = 0
    this._isSunk = false
  }

  #checkSunk() {
    if (this.hits < this.length) {
      return false
    }
    this._isSunk = true
    return true
  }

  hit() {
    this.hits += 1
    this.#checkSunk()
  }

  get isSunk() {
    return this._isSunk
  }
}

export default Ship
