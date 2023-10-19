const menu = {
  prepareMenu: function prepareMenu(game) {
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
      // Check local storage to determine if loadGame button enabled
    }

    function closeModal(modal) {
      modal.style.display = 'none'
    }

    function startGame() {
      const isVsComputer = playerToggle.checked
      game(isVsComputer)
      // Remove any existing save-game to keep LS tidy
      localStorage.clear()
      closeModal(optionsModal)
    }

    function showDropdown() {
      document.getElementById('no-saved-game-dropdown').style.display = 'block'
    }
    function closeDropdown() {
      document.getElementById('no-saved-game-dropdown').style.display = 'none'
    }

    function loadGame() {
      const gameState = JSON.parse(localStorage.getItem('gameState'))
      if (!gameState) {
        showDropdown()
        return
      }
      game(gameState.players.player2.isAI, gameState)
      // Remove the now loaded save-game to keep LS tidy
      localStorage.clear()
      closeModal(optionsModal)
    }

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
