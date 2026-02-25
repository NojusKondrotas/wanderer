import { selectedElement } from "../../instantiable-components/component-handler.js"
import { toggleWritingMode } from "../../instantiable-components/note.js"
import { closeWindow } from "../../main/whiteboard-renderer.js"
import { AppStates } from "../../runtime/states-handler.js"
import { turnOffContextMenu } from "../context-menus/handler-context-menu.js"

export const titlebar = document.getElementById('titlebar')!
const titlebarVisual = document.getElementById('titlebar-visual')!

const titlebarFullScreenCtrlFrame = document.getElementById('frame-fullscreen-window')!
const titlebarMaximizeCtrlFrame = document.getElementById('frame-maximize-window')!
const titlebarMinimizeCtrlFrame = document.getElementById('frame-minimize-window')!
const titlebarCloseCtrlFrame = document.getElementById('frame-close-window')!
const titlebarGlobalConfigurationFrame = document.getElementById('frame-global-config-menu')!

export function toggleTitlebar(flag: boolean){
    if(flag){
        titlebar.style.display = 'inline'
    }else{
        titlebar.style.display = 'none'
    }
}

export function toggleTitlebarVisualHover(flag: boolean){
    if(flag){
        titlebar.addEventListener('mouseover', mouseOver_Titlebar)
    }else{
        titlebar.removeEventListener('mouseover', mouseOver_Titlebar)
    }
}

export function initTitlebar(){
    if(AppStates.isTitlebarLocked){
        titlebarVisual.style.transform = 'translateY(0px)'
        toggleTitlebarVisualHover(false)
    }else{
        titlebarVisual.style.transform = 'translateY(-80px)'
        toggleTitlebarVisualHover(true)
    }

    titlebar.addEventListener('mouseleave', () => {
        if(!AppStates.isTitlebarLocked){
            toggleTitlebarVisualHover(true)
            titlebarVisual.style.transform = 'translateY(-80px)'
        }
    })
}

function mouseOver_Titlebar(){
    titlebarVisual.style.transform = 'translateY(0px)'
}

export function titlebarToggleFullScreen(){
    window.wandererAPI.setFullScreen()
    if(!AppStates.isPromptFirstTime) turnOffContextMenu()
}

export function titlebarToggleMaximized(){
    window.wandererAPI.setMaximized()
    if(!AppStates.isPromptFirstTime) turnOffContextMenu()
}

export function titlebarToggleMinimized(){
    window.wandererAPI.setMinimized()
    if(!AppStates.isPromptFirstTime) turnOffContextMenu()
}

export function titlebarToggleTitlebarLock(){
    if(AppStates.isTitlebarLocked){
        titlebarVisual.style.transform = 'translateY(-80px)'
        toggleTitlebarVisualHover(true)

        AppStates.isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.transform = 'translateY(0px)'
        toggleTitlebarVisualHover(false)

        AppStates.isTitlebarLocked = true
    }

    if(!AppStates.isPromptFirstTime) turnOffContextMenu()
}

titlebarVisual.addEventListener('mousedown', (e) => {
    e.stopPropagation()

    if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id)
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

titlebarGlobalConfigurationFrame.addEventListener('click', (e) => {
    e.stopPropagation();
    titlebarGlobalConfigurationFrame.blur();
    window.wandererAPI.openConfigs();
})