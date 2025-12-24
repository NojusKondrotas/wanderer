class WhiteboardPositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isResizingElement = false

    static resize(){
        if(activeBorder === 'right'){
            let currentWidth = parseInt(selectedElement.style.width)
            if(isNaN(currentWidth)){
                currentWidth = selectedElement.getBoundingClientRect().width - 10
            }
            selectedElement.style.width = Math.max(currentWidth - Math.floor(dragDiff.x), 20) + 'px'
        }else if(activeBorder === 'left'){
            let currentWidth = parseInt(selectedElement.style.width)
            if(isNaN(currentWidth)){
                currentWidth = selectedElement.getBoundingClientRect().width - 10
            }
            const newWidth = Math.max(currentWidth + Math.floor(dragDiff.x), 20)
            if(newWidth === 20 && dragDiff.x <= 0) return

            selectedElement.style.width = newWidth + 'px'
            selectedElement.style.left = selectedElement.offsetLeft - Math.floor(dragDiff.x) + 'px'
        }
    }

    static element_MouseDown(ev, el){
        if(ev.button !== 2){
            ev.stopPropagation()
            if(StatesHandler.isWritingElement) return toggleWritingMode(false, selectedElement.id)
            if(StatesHandler.isContextMenuOpen){
                turnOffContextMenu()
                return
            }

            WhiteboardPositioningHandler.startDrag(ev, false, true, false)
            
            if(el.classList.contains('.note')) toggleWritingMode(false, el.id)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(StatesHandler.isWritingElement) return
        if(StatesHandler.isDrawingPath){
            if(!checkIfDraggedEnough()){
                this.isDraggingElement = false;
                if(el.id === selectedPath.startNoteID){
                    deletePathByID(selectedPath.id)
                    return this.endDrag(ev)
                }
                terminatePathDrawing(ev, el.id)
                return this.endDrag(ev)
            }
        }
        else this.endDrag(ev)
    }

    static update(ev){
        updateMouseDrag(ev)
        
        if (this.isResizingElement){
            this.resize()
        }else if(this.isDraggingBoard){
            updateComponentPositions(parentWhiteboard)
        }else if(isDraggingWindow){
            moveWindow()
        }else if (isResizingWindow) {
            resizeWindow()
        }else if(this.isDraggingElement){
            updateElementPositionByID(selectedElement.id)

            for(let [key, value] of allPaths){
                let hasUpdated = false
                if(value.startNoteID === selectedElement.id){
                    value.startPosition.x -= dragDiff.x
                    value.startPosition.y -= dragDiff.y
                    hasUpdated = true
                }else if(value.endNoteID === selectedElement.id){
                    value.endPosition.x -= dragDiff.x
                    value.endPosition.y -= dragDiff.y
                    hasUpdated = true
                }

                if(hasUpdated){
                    const mousePos = convertToWhiteboardSpace(ev.clientX, ev.clientY)
                    let startPoint, endPoint
                    if(StatesHandler.isDrawingPathEnd){
                        startPoint = {
                            x: value.startPosition.x,
                            y: value.startPosition.y
                        }
                        if(StatesHandler.isDrawingPath && value === selectedPath){
                            endPoint = mousePos
                        }else{
                            endPoint = {
                                x: value.endPosition.x,
                                y: value.endPosition.y
                            }
                        }
                    }else{
                        endPoint = {
                            x: value.endPosition.x,
                            y: value.endPosition.y
                        }
                        if(StatesHandler.isDrawingPath && value === selectedPath){
                            startPoint = mousePos
                        }else{
                            startPoint = {
                                x: value.startPosition.x,
                                y: value.startPosition.y
                            }
                        }
                    }
                    updatePathPosition(value, startPoint, endPoint)
                }
            }
        }
        
        if(StatesHandler.isDrawingPath){
            const mousePos = convertToWhiteboardSpace(ev.clientX, ev.clientY)
            toggleTitlebar(false)
            if(StatesHandler.isDrawingPathEnd)
                updatePathPosition(selectedPath, selectedPath.startPosition, mousePos)
            else
                updatePathPosition(selectedPath, mousePos, selectedPath.endPosition)
        }
    }

    static startDrag(ev, isBoard, isEl, isResizingElement, isWindow, isWinResizing){
        if(ev.button === 2) return

        if(StatesHandler.isContextMenuOpen){
            turnOffContextMenu()
            closePathConnectionContextMenu()
            return
        }
        if(StatesHandler.isConfigsOpen){
            hideAllConfigs();
            return;
        }
        if(StatesHandler.isWritingElement){
            toggleWritingMode(false, selectedElement.id)
            return
        }

        document.querySelectorAll('.note-editor').forEach((noteEditor) => {
            document.getElementById(noteEditor.id).contentEditable = 'false'
        })

        resetMouseDrag(ev)
        resetWindowDrag(ev)

        if(isBoard){
            this.isDraggingBoard = true
        }else if(isEl){
            this.isDraggingElement = true
        }else if(isResizingElement){
            this.isResizingElement = true
        }else if(isWindow){
            isDraggingWindow = true
        }else if(isWinResizing){
            isResizingWindow = true
        }

        toggleTitlebar(false)
        handleKeybindGuideAppearance(false)
    }

    static endDrag(ev){
        if(ev.button === 2) return

        if(StatesHandler.isContextMenuOpen){
            turnOffContextMenu()
            closePathConnectionContextMenu()
        }
        if(this.isResizingElement){
            this.isResizingElement = false
            document.body.style.cursor = 'default'
        }
        if(StatesHandler.isWritingElement){
            toggleWritingMode(false, selectedElement.id)
            return
        }
        if(suppressNextMouseUp){
            suppressNextMouseUp = false
            return
        }
        if(StatesHandler.isTabsMenuOpen){
            if(!checkIfDraggedEnough()){
                closeTabsMenu()
            }
        }
        if(StatesHandler.isDrawingPath){
            if(!checkIfDraggedEnough()){
                terminatePathDrawing(ev, null)
            }
        }

        toggleTitlebar(true)
        const el = document.elementFromPoint(ev.clientX, ev.clientY)
        if (el === titlebar) {
            toggleTitlebarVisualHover(false)
        }
        
        this.isDraggingBoard = false
        this.isDraggingElement = false
        resetMouseDrag(ev)
        resetWindowDrag(ev)

        selectedElement = null;
        selectedPath = null;
        handleKeybindGuideAppearance(true)
    }
}

function getAbsolutePosition(el) {
    const rect = el.getBoundingClientRect();
    const parentRect = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top - parentRect.top - marginTop,
        left: rect.left - parentRect.left - marginLeft
    };
}

function updateElementPositionByID(elID) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - dragDiff.x
    const offsetY = elPos.y - dragDiff.y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function updateComponentPositions(){
    for (let [key, value] of elementPositions){
        updateElementPositionByID(key)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= dragDiff.x
        path.startPosition.y -= dragDiff.y
        path.endPosition.x -= dragDiff.x
        path.endPosition.y -= dragDiff.y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function genMouseDown_WhiteboardMoveHandler(e){
    if(isCombo(keybinds[windowDragKeybind])) WhiteboardPositioningHandler.startDrag(e, false, false, false, true, false)
    else if(isCombo(keybinds[windowResizeKeybind])) WhiteboardPositioningHandler.startDrag(e, false, false, false, false, true)
    else WhiteboardPositioningHandler.startDrag(e, true, false, false, false)
}

function genMouseMove_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.update(e)
}

function genMouseUp_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.endDrag(e)
}