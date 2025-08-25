const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')

const [titlebarFullscreenCtrlFrame, titlebarFullscreenCtrlContextMenu] = document.getElementsByClassName('fullscreen-window')
const [titlebarMinimizeCtrlFrame, titlebarMinimizeCtrlContextMenu] = document.getElementsByClassName('minimize-window')
const [titlebarCloseCtrlFrame, titlebarCloseCtrlContextMenu] = document.getElementsByClassName('close-window')
const [titlebarLockCtrlFrame, titlebarLockCtrlContextMenu] = document.getElementsByClassName('lock-titlebar')

let isMaximized = false, isTitlebarLocked = false

titlebarFullscreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.isFullscreen().then((isFull) => {
        if(isFull) window.wandererAPI.setFullscreen(false)
        else window.wandererAPI.setFullscreen(true)
    })

    titlebarFullscreenCtrlFrame.blur()

    turnOffContextMenu()
})
titlebarFullscreenCtrlContextMenu.addEventListener('mousedown', (e) => {
    e.stopPropagation()

    window.wandererAPI.isFullscreen().then((isFull) => {
        if(isFull) window.wandererAPI.setFullscreen(false)
        else window.wandererAPI.setFullscreen(true)
    })

    titlebarFullscreenCtrlContextMenu.blur()

    turnOffContextMenu()
})

titlebarMinimizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMinimized()

    titlebarMinimizeCtrlFrame.blur()

    turnOffContextMenu()
})
titlebarMinimizeCtrlContextMenu.addEventListener('mousedown', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMinimized()

    titlebarMinimizeCtrlContextMenu.blur()

    turnOffContextMenu()
})

titlebarCloseCtrlFrame.addEventListener('click', (e) => {e.stopPropagation(); window.wandererAPI.closeWindow(); turnOffContextMenu()})
titlebarCloseCtrlContextMenu.addEventListener('mousedown', (e) => {e.stopPropagation(); window.wandererAPI.closeWindow(); turnOffContextMenu()})

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
titlebarLockCtrlContextMenu.addEventListener('mousedown', (e) => {
    e.stopPropagation()
    if(isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        isTitlebarLocked = true
    }

    titlebarLockCtrlContextMenu.blur()

    turnOffContextMenu()
})