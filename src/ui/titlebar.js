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

function toggleTitlebarVisual(flag){
    if(flag){
        titlebar.addEventListener('mouseover', mouseOver_Titlebar)
    }else{
        titlebar.removeEventListener('mouseover', mouseOver_Titlebar)
    }
}

function initTitlebar(){
    titlebarVisual.style.transform = 'translateY(-80px)'
    
    titlebar.addEventListener('mouseover', mouseOver_Titlebar)

    titlebar.addEventListener('mouseleave', () => {
        toggleTitlebarVisual(true)
        titlebarVisual.style.transform = 'translateY(-80px)'
    })
}

function mouseOver_Titlebar(){
    titlebarVisual.style.transform = 'translateY(0px)'
}

titlebarVisual.addEventListener('mousedown', (e) => {
    e.stopPropagation()

    if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
})

titlebarFullScreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setFullScreen()

    titlebarFullScreenCtrlFrame.blur()

    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
})

titlebarMaximizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMaximized()

    titlebarMaximizeCtrlFrame.blur()

    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
})

titlebarMinimizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()

    window.wandererAPI.setMinimized()

    titlebarMinimizeCtrlFrame.blur()

    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
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

    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
})