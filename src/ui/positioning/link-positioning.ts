import { isCombo, KeybindIndices, keybinds } from "../keybinds.js"
import { MouseDragHandler } from "./mouse-drag-calc.js"
import { WindowPositioningHandler } from "./window-positioning.js"

export class LinkPositioningHandler {
    static cover = document.getElementById('cover')!

    static startDrag(ev, isDraggingWin, isResizingWin){
        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev)
        this.cover.style.display = 'inline-block'
        if(isDraggingWin){
            WindowPositioningHandler.isDraggingWindow = true
        }else if(isResizingWin){
            WindowPositioningHandler.isResizingWindow = true
        }
    }

    static update(ev){
        MouseDragHandler.updateMouseDrag(ev)
        if(WindowPositioningHandler.isDraggingWindow){
            WindowPositioningHandler.moveWindow()
        }else if(WindowPositioningHandler.isResizingWindow){
            WindowPositioningHandler.resizeWindow()
        }
    }

    static endDrag(ev){
        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev)
        this.cover.style.display = 'none'
    }
}

function mouseDown_LinkMoveHandler(e){
    const isDragWin = isCombo(keybinds[KeybindIndices.windowDragKeybind])
    const isResizeWin = isCombo(keybinds[KeybindIndices.windowResizeKeybind])

    if(isDragWin) LinkPositioningHandler.startDrag(e, true, false)
    else if(isResizeWin) LinkPositioningHandler.startDrag(e, false, true)
}

function mouseMove_LinkMoveHandler(e){
    LinkPositioningHandler.update(e)
}

function mouseUp_LinkMoveHandler(e){
    LinkPositioningHandler.endDrag(e)
}