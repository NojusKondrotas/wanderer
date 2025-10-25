class WhiteboardPositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isResizingElement = false

    static resize(){
        if(activeBorder === 'right'){
            const currentWidth = parseInt(selectedElement.style.width) || 80
            selectedElement.style.width = Math.max(currentWidth - Math.floor(dragDiff.x), 80) + 'px'
        }else if(activeBorder === 'left'){
            const currentWidth = parseInt(selectedElement.style.width) || 80
            const newWidth = Math.max(currentWidth + Math.floor(dragDiff.x), 80)
            if(newWidth === 80 && dragDiff.x <= 0) return

            selectedElement.style.width = newWidth + 'px'
            selectedElement.style.left = selectedElement.offsetLeft - Math.floor(dragDiff.x) + 'px'
        }else if(activeBorder === 'bottom'){
            const currentHeight = parseInt(selectedElement.style.height) || 25.65
            selectedElement.style.height = Math.max(currentHeight + Math.floor(dragDiff.y) * -1, 25.65) + 'px'
        }else if(activeBorder === 'top'){
            const currentHeight = parseInt(selectedElement.style.height) || 25.65
            const newHeight = Math.max(currentHeight + Math.floor(dragDiff.y), 25.65)
            if(newHeight === 25.65 && dragDiff.y <= 0) return
            
            selectedElement.style.height = newHeight + 'px'
            selectedElement.style.top = (selectedElement.offsetTop - Math.floor(dragDiff.y)) + 'px'
        }
    }

    static element_MouseDown(ev, el){
        if(ev.button !== 2){
            ev.stopPropagation()
            if(StatesHandler.isWritingElement) return toggleQuillWritingMode(false, selectedElement.id)
            if(StatesHandler.isContextMenuOpen){
                turnOffContextMenu()
                return
            }

            WhiteboardPositioningHandler.startDrag(ev, false, true, false)
            
            if(el.classList.contains('.note')) toggleQuillWritingMode(false, el.id)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(StatesHandler.isWritingElement) return
        if(StatesHandler.isDrawingPath){
            if(!checkIfDraggedEnough()){
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
                    const mousePos = convertToRealWhiteboardCoords(ev.clientX, ev.clientY)
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
            const mousePos = convertToRealWhiteboardCoords(ev.clientX, ev.clientY)
            toggleTitlebar(false)
            if(StatesHandler.isDrawingPathEnd)
                updatePathPosition(selectedPath, selectedPath.startPosition, mousePos)
            else
                updatePathPosition(selectedPath, mousePos, selectedPath.endPosition)
        }
    }

    static startDrag(ev, isBoard, isEl, isResizingElement, isWindow, isWinResizing){
        if(ev.button === 2) return
        if(StatesHandler.isQuillToolbarEdit) return

        if(StatesHandler.isContextMenuOpen){
            turnOffContextMenu()
            return
        }
        if(StatesHandler.isWritingElement){
            toggleQuillWritingMode(false, selectedElement.id)
            return
        }

        document.querySelectorAll('.ql-editor').forEach((qlEditor) => {
            document.getElementById(qlEditor.id).contentEditable = 'false'
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
        
        if(this.isResizingElement){
            this.isResizingElement = false
            document.body.style.cursor = 'default'
        }
        if(StatesHandler.isQuillToolbarEdit){
            StatesHandler.isQuillToolbarEdit = false
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

        selectedElement = null
        handleKeybindGuideAppearance(true)
    }
}

function updateElementPositionByID(elID) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - dragDiff.x
    const offsetY = elPos.y - dragDiff.y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`
}

function updateComponentPositions(container){
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