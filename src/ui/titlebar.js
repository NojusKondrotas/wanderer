const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')

const titlebarFullScreenCtrlFrame = document.getElementById('frame-fullscreen-window')
const titlebarMinimizeCtrlFrame = document.getElementById('frame-minimize-window')
const titlebarCloseCtrlFrame = document.getElementById('frame-close-window')
const titlebarGlobalConfigurationFrame = document.getElementById('frame-global-config-menu')
const titlebarLockCtrlFrame = document.getElementById('frame-lock-titlebar')

let isFullScreen = true, isTitlebarLocked = false

titlebarFullScreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.isFullScreen().then(current => {
        isFullScreen = !current
        window.wandererAPI.setFullScreen(isFullScreen)
    })

    titlebarFullScreenCtrlFrame.blur()

    turnOffContextMenu()
})

titlebarMinimizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMinimized()

    titlebarMinimizeCtrlFrame.blur()

    turnOffContextMenu()
})

titlebarCloseCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    window.wandererAPI.closeWindow()
})

titlebarLockCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    if(isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        isTitlebarLocked = true
    }

    titlebarLockCtrlFrame.blur()

    turnOffContextMenu()
})