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

function toggleTitlebarVisualHover(flag){
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
        if(!StatesHandler.isTitlebarLocked){
            toggleTitlebarVisualHover(true)
            titlebarVisual.style.transform = 'translateY(-80px)'
        }
    })
}

function mouseOver_Titlebar(){
    titlebarVisual.style.transform = 'translateY(0px)'
}

function titlebarToggleFullScreen(){
    window.wandererAPI.setFullScreen()
    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
}

function titlebarToggleMaximized(){
    window.wandererAPI.setMaximized()
    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
}

function titlebarToggleMinimized(){
    window.wandererAPI.setMinimized()
    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
}

function titlebarToggleTitlebarLock(){
    if(StatesHandler.isTitlebarLocked){
        titlebarVisual.style.transform = 'translateY(-80px)'
        toggleTitlebarVisualHover(true)

        StatesHandler.isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.transform = 'translateY(0px)'
        toggleTitlebarVisualHover(false)

        StatesHandler.isTitlebarLocked = true
    }

    if(!StatesHandler.isPromptFirstTime) turnOffContextMenu()
}

titlebarVisual.addEventListener('mousedown', (e) => {
    e.stopPropagation()

    if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
})

titlebarFullScreenCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    titlebarFullScreenCtrlFrame.blur()
    titlebarToggleFullScreen()
})

titlebarMaximizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    titlebarMaximizeCtrlFrame.blur()
    titlebarToggleMaximized()
})

titlebarMinimizeCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    titlebarMinimizeCtrlFrame.blur()
    titlebarToggleMinimized()
})

titlebarCloseCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    closeWindow()
})

titlebarLockCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    titlebarLockCtrlFrame.blur()
    titlebarToggleTitlebarLock()
})