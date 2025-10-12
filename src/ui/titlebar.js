const titlebar = document.getElementById('titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')

const titlebarFullScreenCtrlFrame = document.getElementById('frame-fullscreen-window')
const titlebarMaximizeCtrlFrame = document.getElementById('frame-maximize-window')
const titlebarMinimizeCtrlFrame = document.getElementById('frame-minimize-window')
const titlebarCloseCtrlFrame = document.getElementById('frame-close-window')
const titlebarGlobalConfigurationFrame = document.getElementById('frame-global-config-menu')
const titlebarLockCtrlFrame = document.getElementById('frame-lock-titlebar')

function toggleTitlebar(flag){
    if(flag){
        titlebar.style.display = 'inline'
    }else{
        titlebar.style.display = 'none'
    }
}

titlebarFullScreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setFullScreen()

    titlebarFullScreenCtrlFrame.blur()

    turnOffContextMenu()
})

titlebarMaximizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMaximized()

    titlebarMaximizeCtrlFrame.blur()

    turnOffContextMenu()
})

titlebarMinimizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMinimized()

    titlebarMinimizeCtrlFrame.blur()

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
    closeWindow()
})

titlebarLockCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    if(StatesHandler.isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        StatesHandler.isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        StatesHandler.isTitlebarLocked = true
    }

    titlebarLockCtrlFrame.blur()

    turnOffContextMenu()
})