const titlebarContextMenu = document.getElementById('titlebar-context-menu')

const titlebarFullScreenCtrlContextMenu = document.getElementById('tcm-fullscreen-window')
const titlebarMaximizeCtrlContextMenu = document.getElementById('tcm-maximize-window')
const titlebarMinimizeCtrlContextMenu = document.getElementById('tcm-minimize-window')
const titlebarCloseCtrlContextMenu = document.getElementById('tcm-close-window')
const titlebarGlobalConfigurationContextMenu = document.getElementById('tcm-global-config-menu')

titlebarFullScreenCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setFullScreen()

    turnOffContextMenu()
})

titlebarMaximizeCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMaximized()

    turnOffContextMenu()
})

titlebarMinimizeCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()
    
    window.wandererAPI.setMinimized()

    turnOffContextMenu()
})

titlebarCloseCtrlContextMenu.addEventListener('click', (e) => {
    e.stopPropagation()
    closeWindow()
})