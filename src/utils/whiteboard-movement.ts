import { AppStates } from "../runtime/states-handler.js"
import { genMouseMove_ContextMenuHandler } from "../ui/context-menus/handler-context-menu.js"
import { initWhiteboards } from "../ui/parent-whiteboard-handler.js";
import { genMouseDown_WhiteboardMoveHandler, genMouseMove_WhiteboardMoveHandler, genMouseUp_WhiteboardMoveHandler } from "../ui/positioning/whiteboard-positioning.js"
import { closeTabsMenu } from "../ui/tabs-menu-handler.js"

export function initWhiteboardMovement() {
    initWhiteboards();

    window.addEventListener('mousemove', (e) => {
        genMouseMove_WhiteboardMoveHandler(e)
        genMouseMove_ContextMenuHandler(e)
    })

    window.addEventListener('mousedown', (e) => {
        closeTabsMenu()
        genMouseDown_WhiteboardMoveHandler(e)
    })
    
    window.addEventListener('mouseup', (e) => {
        genMouseUp_WhiteboardMoveHandler(e)
    })
}