const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')

const titlebarFullscreenCtrlFrame = document.getElementById('frame-fullscreen-window')
const titlebarMinimizeCtrlFrame = document.getElementById('frame-minimize-window')
const titlebarCloseCtrlFrame = document.getElementById('frame-close-window')
const titlebarGlobalConfigurationFrame = document.getElementById('frame-global-config-menu')
const titlebarLockCtrlFrame = document.getElementById('frame-lock-titlebar')

let isFullscreen = true, isTitlebarLocked = false

titlebarFullscreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.isFullscreen().then(current => {
        isFullscreen = !current
        window.wandererAPI.setFullscreen(isFullscreen)
    })

    titlebarFullscreenCtrlFrame.blur()

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
    save()
    window.wandererAPI.closeWindow()
    turnOffContextMenu()
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