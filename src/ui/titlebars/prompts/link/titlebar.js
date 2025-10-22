const titlebarVisual = document.getElementById('titlebar-visual')

const titlebarFullScreenCtrlFrame = document.getElementById('frame-fullscreen-window')
const titlebarMaximizeCtrlFrame = document.getElementById('frame-maximize-window')
const titlebarMinimizeCtrlFrame = document.getElementById('frame-minimize-window')
const titlebarCloseCtrlFrame = document.getElementById('frame-close-window')
const titlebarGlobalConfigurationFrame = document.getElementById('frame-global-config-menu')

const titlebarMoverCtrlFrame = document.getElementById('frame-mover-titlebar')

function titlebarToggleFullScreen(){
    window.wandererAPI.setFullScreen()
    if(!StatesHandler.isPromptFirstTime ||
        !StatesHandler.isPromptLink) turnOffContextMenu()
}

function titlebarToggleMaximized(){
    window.wandererAPI.setMaximized()
    if(!StatesHandler.isPromptFirstTime ||
        !StatesHandler.isPromptLink) turnOffContextMenu()
}

function titlebarToggleMinimized(){
    window.wandererAPI.setMinimized()
    if(!StatesHandler.isPromptFirstTime ||
        !StatesHandler.isPromptLink) turnOffContextMenu()
}

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

titlebarMoverCtrlFrame.addEventListener('mousedown', (e) => {
    e.stopPropagation()
    titlebarMoverCtrlFrame.blur()
    mouseDown_LinkMoveHandler(e)
})