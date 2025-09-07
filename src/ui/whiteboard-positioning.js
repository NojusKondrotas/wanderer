class PositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static dragStart = { x: 0, y: 0 }
    static dragDiff = { x: 0, y: 0 }
    static dragTotalDiff = { x: 0, y: 0 }

    static checkIfDraggedEnough(){
        const movedX = this.dragTotalDiff.x
        const movedY = this.dragTotalDiff.y
        return movedX > 5 || movedY > 5
    }

    static element_MouseDown(ev, el){
        if(ev.button !== 2){
            ev.stopPropagation()
            if(isWritingElement) return
            if(isContextMenuOpen){
                turnOffContextMenu()
                return
            }

            PositioningHandler.startDrag(ev, false, true)
            
            toggleQuillWritingMode(false, el.id)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(isWritingElement) return
        if(isDrawingPath){
            if(!this.checkIfDraggedEnough()){
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
        if(this.isDraggingBoard){
            this.dragDiff = {
                x: this.dragStart.x - ev.clientX,
                y: this.dragStart.y - ev.clientY
            }
            this.dragStart = {
                x: ev.clientX,
                y: ev.clientY
            }
            this.dragTotalDiff.x += Math.abs(this.dragDiff.x)
            this.dragTotalDiff.y += Math.abs(this.dragDiff.y)

            updateComponentPositions(whiteboard)
        }else if(this.isDraggingElement){
            this.dragDiff = {
                x: this.dragStart.x - ev.clientX,
                y: this.dragStart.y - ev.clientY
            }
            this.dragStart = {
                x: ev.clientX,
                y: ev.clientY
            }
            this.dragTotalDiff.x += Math.abs(this.dragDiff.x)
            this.dragTotalDiff.y += Math.abs(this.dragDiff.y)

            updateElementPositionByID(selectedElement.id)

            allPaths.forEach(path => {
                let hasUpdated = false
                if(path.startNoteID === selectedElement.id){
                    path.startPosition.x -= this.dragDiff.x
                    path.startPosition.y -= this.dragDiff.y
                    hasUpdated = true
                }else if(path.endNoteID === selectedElement.id){
                    path.endPosition.x -= this.dragDiff.x
                    path.endPosition.y -= this.dragDiff.y
                    hasUpdated = true
                }

                if(hasUpdated){
                    let startPoint, endPoint
                    if(isDrawingPathEnd){
                        startPoint = {
                            x: path.startPosition.x,
                            y: path.startPosition.y
                        }
                        if(isDrawingPath && path === selectedPath){
                            endPoint = {
                                x: ev.clientX,
                                y: ev.clientY
                            }
                        }else{
                            endPoint = {
                                x: path.endPosition.x,
                                y: path.endPosition.y
                            }
                        }
                    }else{
                        endPoint = {
                            x: path.endPosition.x,
                            y: path.endPosition.y
                        }
                        if(isDrawingPath && path === selectedPath){
                            startPoint = {
                                x: ev.clientX,
                                y: ev.clientY
                            }
                        }else{
                            startPoint = {
                                x: path.startPosition.x,
                                y: path.startPosition.y
                            }
                        }
                    }
                    updatePathPosition(path, startPoint, endPoint)
                }
            })
        }
        
        if(isDrawingPath){
            if(isDrawingPathEnd)
                updatePathPosition(selectedPath, selectedPath.startPosition, { x: ev.clientX, y: ev.clientY })
            else
                updatePathPosition(selectedPath, { x: ev.clientX, y: ev.clientY }, selectedPath.endPosition)
        }
    }

    static startDrag(ev, isBoard, isEl){
        if(isQuillToolbarEdit) return
        if(ev.button !== 2){
            if(isContextMenuOpen){
                turnOffContextMenu()
                return
            }
            if(isWritingElement){
                toggleQuillWritingMode(false, selectedElement.id)
                return
            }

            document.querySelectorAll('.ql-editor').forEach((qlEditor) => {
                document.getElementById(qlEditor.id).contentEditable = 'false'
            })

            this.dragStart = { x: ev.clientX, y: ev.clientY }
            this.dragDiff = { x: 0, y: 0 }
            this.dragTotalDiff = { x: 0, y: 0 }
            if(isBoard){
                this.isDraggingBoard = true
            }else if(isEl){
                this.isDraggingElement = true
            }

            handleKeybindGuideAppearance(false)
        }
    }

    static endDrag(ev){
        if(isQuillToolbarEdit){
            isQuillToolbarEdit = false
            return
        }
        if(suppressNextMouseUp){
            suppressNextMouseUp = false
            return
        }
        if(isDrawingPath){
            if(!this.checkIfDraggedEnough()){
                terminatePathDrawing(ev, null)
            }
        }

        this.isDraggingBoard = false
        this.isDraggingElement = false
        this.dragStart = {x:0, y:0}
        this.dragDiff = {x:0, y:0}
        this.dragTotalDiff = {x:0, y:0}

        selectedElement = null
        handleKeybindGuideAppearance(true)
    }
}

function updateElementPositionByID(elID) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - PositioningHandler.dragDiff.x
    const offsetY = elPos.y - PositioningHandler.dragDiff.y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID).style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

function updateComponentPositions(container){
    for (let [key, value] of elementPositions){
        updateElementPositionByID(key)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= PositioningHandler.dragDiff.x
        path.startPosition.y -= PositioningHandler.dragDiff.y
        path.endPosition.x -= PositioningHandler.dragDiff.x
        path.endPosition.y -= PositioningHandler.dragDiff.y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function genMouseDown_WhiteboardMoveHandler(e){
    PositioningHandler.startDrag(e, true, false)
}

function genMouseMove_WhiteboardMoveHandler(e){
    PositioningHandler.update(e)
}

function genMouseUp_WhiteboardMoveHandler(e){
    PositioningHandler.endDrag(e)
}