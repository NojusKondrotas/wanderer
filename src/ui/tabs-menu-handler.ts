import { elementPositions } from "../instantiable-components/component-handler.js";
import { generateMultiCircularLayout } from "../runtime/layout.js";
import { AppStates } from "../runtime/states-handler.js";
import { turnOffContextMenu } from "./context-menus/handler-context-menu.js";
import { wbZoom } from "./parent-whiteboard-handler.js";

let openTabs = new Map();
let timeoutTab = 20;

function toggleChildrenFilter(container, cssFunction){
    Array.from(container.children as HTMLCollectionOf<HTMLElement>).forEach(el => {
        if(!el.classList.contains('open-window'))
            el.style.filter = cssFunction
    })
}

export function openTabsMenu(mousePos, windows, previews){
    turnOffContextMenu()
    toggleChildrenFilter(wbZoom, 'blur(3px)')
    generateMultiCircularLayout(mousePos.x, mousePos.y, windows.length, 162, 250, 0, 0, -10, windows, previews)
    windows.forEach(w => {
        // console.log(w, windows.length)
    })

    AppStates.isTabsMenuOpen = true;
}

export function closeTabsMenu(){
    const allWindowOptions = document.querySelectorAll('.open-window')

    allWindowOptions.forEach(w => {
        w.remove()
        elementPositions.delete(w.id)
    })
    toggleChildrenFilter(wbZoom, 'none')
    AppStates.isTabsMenuOpen = false;
}