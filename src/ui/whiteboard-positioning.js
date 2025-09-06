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

    static getAbsoluteMousePos(ev, boundingClientRect){
        return { x: ev.clientX - boundingClientRect.left, y: ev.clientY - boundingClientRect.top}
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
            
            toggleQuillWritingMode(false, el)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(isDrawingPath){
            if(!this.checkIfDraggedEnough()){
                return terminatePathDrawing(ev, el.id)
            }
            if(el.id === selectedPath.startNoteID){
                deletePathByID(selectedPath.id)
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
                    let startPoint = {
                        x: path.startPosition.x,
                        y: path.startPosition.y
                    }
                    let endPoint
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
                    updatePathPosition(path, startPoint, endPoint)
                }
            })
        }
        
        if(isDrawingPath){
            const boundingClientRect = document.getElementById(selectedPath.ID).getBoundingClientRect()
            const mousePos = this.getAbsoluteMousePos(ev, boundingClientRect)
            const updatedPath = updatePathData(selectedPath.startPosition.x, selectedPath.startPosition.y, mousePos.x, mousePos.y, selectedPath.shape)
            document.getElementById(selectedPath.pathVisualID).setAttribute('d', updatedPath)
            document.getElementById(selectedPath.hitPathID).setAttribute('d', updatedPath)
        }
    }

    static startDrag(ev, isBoard, isEl){
        if(ev.button !== 2){
            if(isContextMenuOpen){
                turnOffContextMenu()
                return
            }

            isWritingElement = false
            Array.from(allQlEditors).forEach((qlEditorID) => {
                document.getElementById(qlEditorID).contentEditable = 'false'
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