const menu = {
  prepareMenu: function prepareMenu(game) {
    const openOptionsBtn = document.getElementById('openOptionsBtn')
    const closeModalBtn = document.getElementById('closeModal')
    const newGameBtn = document.getElementById('newGameBtn')
    const loadGameBtn = document.getElementById('loadGameBtn')
    const infoBtn = document.getElementById('infoBtn')
    const playerToggle = document.getElementById('playerToggle')
    const optionsModal = document.getElementById('optionsModal')

    function openModal() {
      optionsModal.style.display = 'block'
      // Check local storage to determine if loadGame button enabled
    }

    function closeModal() {
      optionsModal.style.display = 'none'
    }

    function startGame() {
      const isVsComputer = playerToggle.checked
      game(isVsComputer)
      closeModal()
    }

    function loadGame() {
      // TODO Add load game logic here
      closeModal()
    }

    function showInfo() {
      // TODO Add info display logic here
    }

    openOptionsBtn.addEventListener('click', openModal)
    closeModalBtn.addEventListener('click', closeModal)
    newGameBtn.addEventListener('click', startGame)
    loadGameBtn.addEventListener('click', loadGame)
    infoBtn.addEventListener('click', showInfo)

    // Start with menu visible
    openModal()
  }
}

export default menu
