const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')

const titlebarFullscreenCtrl = document.getElementById('fullscreen-window')
const titlebarMaximizeCtrl = document.getElementById('maximize-window')
const titlebarCloseCtrl = document.getElementById('close-window')
const titlebarLockCtrl = document.getElementById('lock-titlebar')

let isTitlebarLocked = false

titlebarFullscreenCtrl.addEventListener('click', () => {
    window.wandererAPI.isFullscreen().then((isFull) => {
        if(isFull) window.wandererAPI.setFullscreen(false)
        else window.wandererAPI.setFullscreen(true)
    })

    titlebarFullscreenCtrl.blur()
})

titlebarMaximizeCtrl.addEventListener('click', () => {
    window.wandererAPI.isMaximized().then((isMax) => {
        if(isMax) window.wandererAPI.setMaximized(false)
        else window.wandererAPI.setMaximized(true)
    })

    titlebarMaximizeCtrl.blur()
})

titlebarCloseCtrl.addEventListener('click', () => window.wandererAPI.closeWindow())

titlebarLockCtrl.addEventListener('click', () => {
    if(isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        isTitlebarLocked = true
    }

    titlebarLockCtrl.blur()
})