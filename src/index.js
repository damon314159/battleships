import './css/style.css'
import game from './js/game-loop'
import Gameboard from './js/Gameboard'
import helpersDOM from './js/helpersDOM'
import menu from './js/menu'

document.addEventListener('DOMContentLoaded', () => {
  // Once the page has loaded in, we create the necessary grids on the DOM
  const { size } = Gameboard
  const homeBoard = document.querySelector('#home-board')
  helpersDOM.createWaters(homeBoard, size)
  const enemyBoard = document.querySelector('#enemy-board')
  helpersDOM.createWaters(enemyBoard, size)
  // Then show the menu from which a game can be started
  menu.prepareMenu(game)
})
