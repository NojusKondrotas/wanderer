class LinkPositioningHandler {
    static cover = document.getElementById('cover')

    static startDrag(ev, isDraggingWin, isResizingWin){
        resetMouseDrag(ev)
        resetWindowDrag(ev)
        this.cover.style.display = 'inline-block'
        if(isDraggingWin){
            isDraggingWindow = true
        }else if(isResizingWin){
            isResizingWindow = true
        }
    }

    static update(ev){
        updateMouseDrag(ev)
        if(isDraggingWindow){
            WindowPositioningHandler.moveWindow()
        }else if(isResizingWindow){
            WindowPositioningHandler.resizeWindow()
        }
    }

    static endDrag(ev){
        resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev)
        this.cover.style.display = 'none'
    }
}

function mouseDown_LinkMoveHandler(e){
    const isDragWin = isCombo(keybinds[windowDragKeybind])
    const isResizeWin = isCombo(keybinds[windowResizeKeybind])

    if(isDragWin) LinkPositioningHandler.startDrag(e, true, false)
    else if(isResizeWin) LinkPositioningHandler.startDrag(e, false, true)
}

function mouseMove_LinkMoveHandler(e){
    LinkPositioningHandler.update(e)
}

function mouseUp_LinkMoveHandler(e){
    LinkPositioningHandler.endDrag(e)
}