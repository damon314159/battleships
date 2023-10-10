import './css/style.css'
import game from './js/game-loop'
import Gameboard from './js/Gameboard'
import helpersDOM from './js/helpersDOM'

document.addEventListener('DOMContentLoaded', () => {
  const { size } = Gameboard
  const homeBoard = document.querySelector('#home-board')
  helpersDOM.createWaters(homeBoard, size)
  const enemyBoard = document.querySelector('#enemy-board')
  helpersDOM.createWaters(enemyBoard, size)
  game()
})
