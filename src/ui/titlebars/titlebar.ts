import { selectedElement } from "../../instantiable-components/component-handler.js"
import { toggleWritingMode } from "../../instantiable-components/note.js"
import { AppStates } from "../../runtime/states-handler.js"
import { closeWindow } from "../../utils/close-window.js"
import { turnOffContextMenu } from "../context-menus/handler-context-menu.js"

export let titlebar: HTMLElement;
let titlebarVisual: HTMLElement;

let titlebarFullScreenCtrlFrame: HTMLElement;
let titlebarMaximizeCtrlFrame: HTMLElement;
let titlebarMinimizeCtrlFrame: HTMLElement;
let titlebarCloseCtrlFrame: HTMLElement;
let titlebarGlobalConfigurationFrame: HTMLElement;

export function initTitlebar() {
    const titlebarLocal = document.getElementById('titlebar')
    const titlebarVisualLocal = document.getElementById('titlebar-visual')

    const titlebarFullScreenCtrlFrameLocal = document.getElementById('frame-fullscreen-window')
    const titlebarMaximizeCtrlFrameLocal = document.getElementById('frame-maximize-window')
    const titlebarMinimizeCtrlFrameLocal = document.getElementById('frame-minimize-window')
    const titlebarCloseCtrlFrameLocal = document.getElementById('frame-close-window')
    const titlebarGlobalConfigurationFrameLocal = document.getElementById('frame-global-config-menu')

    if(!titlebarLocal || !titlebarVisualLocal
        || !titlebarFullScreenCtrlFrameLocal || !titlebarMaximizeCtrlFrameLocal
        || !titlebarMinimizeCtrlFrameLocal || !titlebarCloseCtrlFrameLocal
        || !titlebarGlobalConfigurationFrameLocal
    ) {
        throw new Error("Some titlebar DOM elements not found, cannot proceed");
    }

    titlebar = titlebarLocal
    titlebarVisual = titlebarVisualLocal

    titlebarFullScreenCtrlFrame = titlebarFullScreenCtrlFrameLocal
    titlebarMaximizeCtrlFrame = titlebarMaximizeCtrlFrameLocal
    titlebarMinimizeCtrlFrame = titlebarMinimizeCtrlFrameLocal
    titlebarCloseCtrlFrame = titlebarCloseCtrlFrameLocal
    titlebarGlobalConfigurationFrame = titlebarGlobalConfigurationFrameLocal

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
        e.stopPropagation();
        closeWindow();
    })

    titlebarGlobalConfigurationFrame.addEventListener('click', (e) => {
        e.stopPropagation();
        titlebarGlobalConfigurationFrame.blur();
        window.wandererAPI.openConfigs();
    })
}

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