const titlebarContextMenu = document.getElementById('titlebar-context-menu')

const titlebarFullscreenCtrlContextMenu = document.getElementById('tcm-fullscreen-window')
const titlebarMinimizeCtrlContextMenu = document.getElementById('tcm-minimize-window')
const titlebarCloseCtrlContextMenu = document.getElementById('tcm-close-window')
const titlebarGlobalConfigurationContextMenu = document.getElementById('tcm-global-config-menu')

titlebarFullscreenCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.isFullscreen().then(current => {
        isFullscreen = !current
        window.wandererAPI.setFullscreen(isFullscreen)
    })

    turnOffContextMenu()
})

titlebarMinimizeCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()
    
    window.wandererAPI.setMinimized()

    turnOffContextMenu()
})

titlebarCloseCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()
    window.wandererAPI.closeWindow()
    turnOffContextMenu()
})