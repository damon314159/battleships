const menu = {
  prepareMenu: function prepareMenu(game) {
    // Target all menu controls
    const openOptionsBtn = document.getElementById('open-options-btn')
    const closeOptionsModalBtn = document.getElementById('close-options-modal')
    const newGameBtn = document.getElementById('new-game-btn')
    const loadGameBtn = document.getElementById('load-game-btn')
    const infoBtn = document.getElementById('info-btn')
    const playerToggle = document.getElementById('player-toggle')
    const optionsModal = document.getElementById('options-modal')
    const infoModal = document.getElementById('info-modal')
    const closeInfoModalBtn = document.getElementById('close-info-modal')
    const closeNoSavedDropdown = document.getElementById('no-saved-game-dropdown')

    function openModal(modal) {
      modal.style.display = 'block'
    }
    function closeModal(modal) {
      modal.style.display = 'none'
    }

    function showDropdown() {
      document.getElementById('no-saved-game-dropdown').style.display = 'block'
    }
    function closeDropdown() {
      document.getElementById('no-saved-game-dropdown').style.display = 'none'
    }

    function startGame() {
      // Read user input on single player vs two player
      const isVsComputer = playerToggle.checked
      // Begin the new game
      game(isVsComputer)
      // Remove any existing save-game to keep LS tidy
      localStorage.clear()
      closeModal(optionsModal)
    }

    function loadGame() {
      // Attempt to retrieve a saved game from local storage
      const gameState = JSON.parse(localStorage.getItem('gameState'))
      if (!gameState) {
        // If there was no such saved game, show a small pop-up to convey this
        showDropdown()
        return
      }
      // Else begin the game, starting from the existing save
      game(gameState.players.player2.isAI, gameState)
      // Remove the now loaded save-game to keep LS tidy
      localStorage.clear()
      closeModal(optionsModal)
    }

    // Attach all functions to their appropriate menu controls
    openOptionsBtn.addEventListener('click', () => openModal(optionsModal))
    closeOptionsModalBtn.addEventListener('click', () => closeModal(optionsModal))
    newGameBtn.addEventListener('click', startGame)
    loadGameBtn.addEventListener('click', loadGame)
    infoBtn.addEventListener('click', () => openModal(infoModal))
    closeInfoModalBtn.addEventListener('click', () => closeModal(infoModal))
    closeNoSavedDropdown.addEventListener('click', closeDropdown)

    // Start with menu visible
    openModal(optionsModal)
  }
}

export default menu
