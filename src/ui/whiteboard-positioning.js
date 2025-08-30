class PositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isDrawingPath = false
    static dragStart = { x: 0, y: 0 }
    static dragDiff = { x: 0, y: 0 }
    static dragTotalStart = { x: 0, y: 0 }
    static dragTotalDiff = { x: 0, y: 0 }

    static updatedPaths = new Array()

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
            
            toggleWritingMode(false, el)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(this.isDrawingPath){
            if(el.id === selectedPath.startNoteID){
                deletePath(selectedPath)
                return this.endDrag(ev)
            }
            const movedX = Math.abs(this.dragTotalDiff.x)
            const movedY = Math.abs(this.dragTotalDiff.y)
            let draggedEnough = movedX > 5 || movedY > 5
            if(!draggedEnough){
                selectedPath.endNoteID = el.id
                const boundingClientRect = document.getElementById(selectedPath.ID).getBoundingClientRect()
                const mousePos = this.getAbsoluteMousePos(ev, boundingClientRect)
                selectedPath.endPosition = mousePos
                this.isDrawingPath = false
                selectedPath = false
                this.endDrag(ev)
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
            this.dragTotalDiff = {
                x: this.dragTotalStart.x - ev.clientX,
                y: this.dragTotalStart.y - ev.clientY
            }

            updateChildrenPositions(whiteboard)
        }else if(this.isDraggingElement){
            this.dragDiff = {
                x: this.dragStart.x - ev.clientX,
                y: this.dragStart.y - ev.clientY
            }
            this.dragStart = {
                x: ev.clientX,
                y: ev.clientY
            }
            this.dragTotalDiff = {
                x: this.dragTotalStart.x - ev.clientX,
                y: this.dragTotalStart.y - ev.clientY
            }

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
                    if(this.isDrawingPath){
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
        
        if(this.isDrawingPath){
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
            Array.from(whiteboard.children).forEach((child) => {
                child.contentEditable = 'false'
            })

            this.updatedPaths = new Array()
            this.dragStart = { x: ev.clientX, y: ev.clientY }
            this.dragDiff = { x: 0, y: 0 }
            this.dragTotalStart = { x: ev.clientX, y: ev.clientY }
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
        if(this.isDrawingPath){
            const movedX = Math.abs(this.dragTotalDiff.x)
            const movedY = Math.abs(this.dragTotalDiff.y)
            console.log(movedX, movedY)
            let draggedEnough = movedX > 5 || movedY > 5
            if(!draggedEnough){
                selectedPath.endNoteID = null
                const boundingClientRect = document.getElementById(selectedPath.ID).getBoundingClientRect()
                const mousePos = this.getAbsoluteMousePos(ev, boundingClientRect)
                selectedPath.endPosition = mousePos
                this.isDrawingPath = false
                selectedPath = false
                this.endDrag(ev)
            }
        }

        this.isDraggingBoard = false
        this.isDraggingElement = false
        this.dragStart = {x:0, y:0}
        this.dragDiff = {x:0, y:0}
        this.dragTotalStart = {x:0, y:0}
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

function updateChildrenPositions(container){
    for(let child of container.children)
        updateElementPositionByID(child.id)
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