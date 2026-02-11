let wbOffset = { x: 0, y: 0 }

class WhiteboardPositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isResizingElement = false

    static elementResizeStart = null

    static dragStates = Object.freeze({
        moveBoard: 'move-board',
        moveElement: 'move-element',
        moveWindow: 'move-window',
        resizeElement: 'resize-element',
        resizeWindow: 'resize-window'
    });

    static resize(ev){
        const dxResizeScreen = ev.clientX - this.elementResizeStart.dx;
        const dxResizeBoard = dxResizeScreen / zoomFactor;

        if (activeBorder === 'right') {
            selectedElement.style.width = Math.max(this.elementResizeStart.width + dxResizeBoard, 22) + 'px';
        } else if (activeBorder === 'left') {
            const newWidth = Math.max(this.elementResizeStart.width - dxResizeBoard, 22);
            if(newWidth === 22 && dxResizeBoard >= 0) return;

            selectedElement.style.width = newWidth + 'px';
            selectedElement.style.left = (this.elementResizeStart.offsetLeft + dxResizeBoard) + 'px';
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

            WhiteboardPositioningHandler.startDrag(ev, WhiteboardPositioningHandler.dragStates.moveElement)
            
            if(el.classList.contains('.note')) toggleWritingMode(false, el.id)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(StatesHandler.isWritingElement) return

        let draggedEnough = MouseDragHandler.checkIfDraggedEnough();
        if(draggedEnough) {
            StatesHandler.willNotWrite = true;
        } else {
            StatesHandler.willNotWrite = false;
        }

        if(el.classList.contains('note-container')) {
            document.body.style.cursor = 'text';
        }

        if(StatesHandler.isDrawingPath){
            if(!draggedEnough){
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
        MouseDragHandler.updateMouseDrag(ev)
        
        if (this.isResizingElement){
            this.resize(ev)
        }else if(this.isDraggingBoard){
            wbOffset.x -= MouseDragHandler.dragDiff.x * zoomFactor;
            wbOffset.y -= MouseDragHandler.dragDiff.y * zoomFactor;

            wbMovement.style.transform = `translate(${wbOffset.x}px, ${wbOffset.y}px)`;
        }else if(WindowPositioningHandler.isDraggingWindow){
            WindowPositioningHandler.moveWindow()
        }else if (WindowPositioningHandler.isResizingWindow) {
            WindowPositioningHandler.resizeWindow()
        }else if(this.isDraggingElement){
            updateElementPositionByID(selectedElement.id)

            const values = allPaths.values();
            for(const v of values){
                let hasUpdated = false
                if(v.startNoteID === selectedElement.id){
                    v.startPosition.x -= MouseDragHandler.dragDiff.x
                    v.startPosition.y -= MouseDragHandler.dragDiff.y
                    v.originStartPos.x -= MouseDragHandler.dragDiff.x
                    v.originStartPos.y -= MouseDragHandler.dragDiff.y
                    hasUpdated = true
                }else if(v.endNoteID === selectedElement.id){
                    v.endPosition.x -= MouseDragHandler.dragDiff.x
                    v.endPosition.y -= MouseDragHandler.dragDiff.y
                    v.originEndPos.x -= MouseDragHandler.dragDiff.x
                    v.originEndPos.y -= MouseDragHandler.dragDiff.y
                    hasUpdated = true
                }

                if(hasUpdated){
                    const mousePos = convertToWhiteboardSpace(ev.clientX, ev.clientY)
                    let startPoint, endPoint
                    if(StatesHandler.isDrawingPathEnd){
                        startPoint = {
                            x: v.startPosition.x,
                            y: v.startPosition.y
                        }
                        if(StatesHandler.isDrawingPath && v === selectedPath){
                            endPoint = mousePos
                        }else{
                            endPoint = {
                                x: v.endPosition.x,
                                y: v.endPosition.y
                            }
                        }
                    }else{
                        endPoint = {
                            x: v.endPosition.x,
                            y: v.endPosition.y
                        }
                        if(StatesHandler.isDrawingPath && v === selectedPath){
                            startPoint = mousePos
                        }else{
                            startPoint = {
                                x: v.startPosition.x,
                                y: v.startPosition.y
                            }
                        }
                    }
                    updatePathPosition(v, startPoint, endPoint)
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

    static startResize(ev) {
        const rect = selectedElement.getBoundingClientRect();

        this.elementResizeStart = {
            dx: ev.clientX,
            width: parseFloat(selectedElement.style.width) || rect.width,
            offsetLeft: selectedElement.offsetLeft
        };
    }

    static startDrag(ev, dragState){
        if(ev.button === 2) return;

        if(StatesHandler.isContextMenuOpen){
            turnOffContextMenu()
            closePathConnectionContextMenu()
            return
        }
        if(StatesHandler.isWritingElement){
            toggleWritingMode(false, selectedElement.id)
            return
        }

        document.querySelectorAll('.note-editor').forEach((noteEditor) => {
            document.getElementById(noteEditor.id).contentEditable = 'false'
        })

        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev);

        this.isDraggingBoard = dragState === this.dragStates.moveBoard;
        this.isDraggingElement = dragState === this.dragStates.moveElement;
        this.isResizingElement = dragState === this.dragStates.resizeElement;
        WindowPositioningHandler.isDraggingWindow = dragState === this.dragStates.moveWindow;
        WindowPositioningHandler.isResizingWindow = dragState === this.dragStates.resizeWindow;

        if(this.isResizingElement) this.startResize(ev);

        toggleTitlebar(false)
        handleKeybindGuideAppearance(false)

        StatesHandler.isDragging = true;
        document.body.style.cursor = 'default';
    }

    static endDrag(ev){
        if(ev.button === 2) return;

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
        if(StatesHandler.isDrawingPath){
            if(!MouseDragHandler.checkIfDraggedEnough()){
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
        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev);

        selectedElement = null;
        handleKeybindGuideAppearance(true)

        StatesHandler.isDragging = false;
    }
}

function getAbsolutePosition(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top - marginTop,
        left: rect.left - marginLeft
    };
}

function setElementLeftPos(elID, x) {
    const elPos = elementPositions.get(elID);

    const offsetX = x;
    const offsetY = elPos.y;
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function setElementTopPos(elID, y) {
    const elPos = elementPositions.get(elID);

    const offsetX = elPos.x;
    const offsetY = y;
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function updateElementPositionByIDByOffset(elID, x, y) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - x
    const offsetY = elPos.y - y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function updateElementPositionByID(elID) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - MouseDragHandler.dragDiff.x
    const offsetY = elPos.y - MouseDragHandler.dragDiff.y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function updateComponentPositionsByOffset(x, y){
    const keys = elementPositions.keys();
    for (const k of keys){
        updateElementPositionByIDByOffset(k, x, y)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= x
        path.startPosition.y -= y
        path.originStartPos.x -= x
        path.originStartPos.y -= y

        path.endPosition.x -= x
        path.endPosition.y -= y
        path.originEndPos.x -= x
        path.originEndPos.y -= y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function updateComponentPositions(){
    const keys = elementPositions.keys();
    for (const k of keys){
        updateElementPositionByID(k)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= MouseDragHandler.dragDiff.x
        path.startPosition.y -= MouseDragHandler.dragDiff.y
        path.originStartPos.x -= MouseDragHandler.dragDiff.x
        path.originStartPos.y -= MouseDragHandler.dragDiff.y

        path.endPosition.x -= MouseDragHandler.dragDiff.x
        path.endPosition.y -= MouseDragHandler.dragDiff.y
        path.originEndPos.x -= MouseDragHandler.dragDiff.x
        path.originEndPos.y -= MouseDragHandler.dragDiff.y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function genMouseDown_WhiteboardMoveHandler(e){
    if(isCombo(keybinds[windowDragKeybind])) WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.moveWindow)
    else if(isCombo(keybinds[windowResizeKeybind])) WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.resizeWindow)
    else WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.moveBoard)
}

function genMouseMove_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.update(e)
}

function genMouseUp_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.endDrag(e)
}