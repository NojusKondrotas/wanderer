class PositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isResizing = false
    static isDraggingWindow = false
    static isResizingWindow = false
    static dragStart = { x: 0, y: 0 }
    static dragDiff = { x: 0, y: 0 }
    static dragTotalStart = { x: 0, y: 0 }
    static dragTotalDiff = { x: 0, y: 0 }
    static dragAbsoluteTotalDiff = { x: 0, y: 0 }
    static windowDimensions = { width: 0, height: 0 }
    static windowCornerOffset = { x: 0, y: 0 }

    static checkIfDraggedEnough(){
        const movedX = this.dragAbsoluteTotalDiff.x
        const movedY = this.dragAbsoluteTotalDiff.y
        return movedX > 5 || movedY > 5
    }

    static resize(){
        if(activeBorder === 'right'){
            const currentWidth = parseInt(selectedElement.style.width) || 80
            selectedElement.style.width = Math.max(currentWidth - Math.floor(this.dragDiff.x), 80) + 'px'
        }else if(activeBorder === 'left'){
            const currentWidth = parseInt(selectedElement.style.width) || 80
            const newWidth = Math.max(currentWidth + Math.floor(this.dragDiff.x), 80)
            if(newWidth === 80 && this.dragDiff.x <= 0) return

            selectedElement.style.width = newWidth + 'px'
            selectedElement.style.left = selectedElement.offsetLeft - Math.floor(this.dragDiff.x) + 'px'
        }else if(activeBorder === 'bottom'){
            const currentHeight = parseInt(selectedElement.style.height) || 25.65
            selectedElement.style.height = Math.max(currentHeight + Math.floor(this.dragDiff.y) * -1, 25.65) + 'px'
        }else if(activeBorder === 'top'){
            const currentHeight = parseInt(selectedElement.style.height) || 25.65
            const newHeight = Math.max(currentHeight + Math.floor(this.dragDiff.y), 25.65)
            if(newHeight === 25.65 && this.dragDiff.y <= 0) return
            
            selectedElement.style.height = newHeight + 'px'
            selectedElement.style.top = (selectedElement.offsetTop - Math.floor(this.dragDiff.y)) + 'px'
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

            PositioningHandler.startDrag(ev, false, true, false)
            
            if(el.classList.contains('.note')) toggleQuillWritingMode(false, el.id)

            selectedElement = el
        }
    }

    static element_MouseUp(ev, el){
        if(StatesHandler.isWritingElement) return
        if(StatesHandler.isDrawingPath){
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
        this.dragDiff = {
            x: this.dragStart.x - ev.screenX,
            y: this.dragStart.y - ev.screenY
        }
        this.dragStart = {
            x: ev.screenX,
            y: ev.screenY
        }
        this.dragAbsoluteTotalDiff.x += Math.abs(this.dragDiff.x)
        this.dragAbsoluteTotalDiff.y += Math.abs(this.dragDiff.y)
        
        if (this.isResizing){
            this.resize()
        }else if(this.isDraggingBoard){
            updateComponentPositions(parentWhiteboard)
        }else if(this.isDraggingWindow){
            const newX = this.dragStart.x - this.windowCornerOffset.x
            const newY = this.dragStart.y - this.windowCornerOffset.y

            window.wandererAPI.moveWindow(
                newX,
                newY,
                this.windowDimensions.width,
                this.windowDimensions.height
            )
        }else if (this.isResizingWindow) {
            const dx = -this.dragDiff.x
            const dy = -this.dragDiff.y

            let { width, height } = this.windowDimensions
            let newX = window.screenX
            let newY = window.screenY

            width += dx
            height += dy

            window.wandererAPI.moveWindow(newX, newY, width, height)

            this.windowDimensions = { width, height }
        }else if(this.isDraggingElement){
            updateElementPositionByID(selectedElement.id)

            for(let [key, value] of allPaths){
                let hasUpdated = false
                if(value.startNoteID === selectedElement.id){
                    value.startPosition.x -= this.dragDiff.x
                    value.startPosition.y -= this.dragDiff.y
                    hasUpdated = true
                }else if(value.endNoteID === selectedElement.id){
                    value.endPosition.x -= this.dragDiff.x
                    value.endPosition.y -= this.dragDiff.y
                    hasUpdated = true
                }

                if(hasUpdated){
                    let startPoint, endPoint
                    if(StatesHandler.isDrawingPathEnd){
                        startPoint = {
                            x: value.startPosition.x,
                            y: value.startPosition.y
                        }
                        if(StatesHandler.isDrawingPath && value === selectedPath){
                            endPoint = {
                                x: ev.clientX,
                                y: ev.clientY
                            }
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
                            startPoint = {
                                x: ev.clientX,
                                y: ev.clientY
                            }
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
            toggleTitlebar(false)
            if(StatesHandler.isDrawingPathEnd)
                updatePathPosition(selectedPath, selectedPath.startPosition, { x: ev.clientX, y: ev.clientY })
            else
                updatePathPosition(selectedPath, { x: ev.clientX, y: ev.clientY }, selectedPath.endPosition)
        }
    }

    static startDrag(ev, isBoard, isEl, isResizing, isWindow, isWinResizing){
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

        this.dragStart = { x: ev.screenX, y: ev.screenY }
        this.dragTotalStart = { x: ev.screenX, y: ev.screenY }
        this.dragDiff = { x: 0, y: 0 }
        this.dragTotalDiff = { x: 0, y: 0 }
        this.dragAbsoluteTotalDiff = { x: 0, y: 0 }
        this.windowDimensions = { width: window.outerWidth, height: window.outerHeight }
        this.windowCornerOffset = {
            x: ev.screenX - window.screenX,
            y: ev.screenY - window.screenY
        }

        if(isBoard){
            this.isDraggingBoard = true
        }else if(isEl){
            this.isDraggingElement = true
        }else if(isResizing){
            this.isResizing = true
        }else if(isWindow){
            this.isDraggingWindow = true
        }else if(isWinResizing){
            this.isResizingWindow = true
        }

        toggleTitlebar(false)
        handleKeybindGuideAppearance(false)
    }

    static endDrag(ev){
        if(ev.button === 2) return
        
        if(this.isResizing){
            this.isResizing = false
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
            if(!this.checkIfDraggedEnough()){
                closeTabsMenu()
            }
        }
        if(StatesHandler.isDrawingPath){
            if(!this.checkIfDraggedEnough()){
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
        this.isDraggingWindow = false
        this.isResizingWindow = false
        this.dragStart = { x: 0, y: 0 }
        this.dragDiff = { x: 0, y: 0 }
        this.dragTotalDiff = { x: 0, y: 0 }
        this.dragAbsoluteTotalDiff = { x: 0, y: 0 }

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
    if(isCombo(keybinds[windowDragKeybind])) PositioningHandler.startDrag(e, false, false, false, true, false)
    else if(isCombo(keybinds[windowResizeKeybind])) PositioningHandler.startDrag(e, false, false, false, false, true)
    else PositioningHandler.startDrag(e, true, false, false, false)
}

function genMouseMove_WhiteboardMoveHandler(e){
    PositioningHandler.update(e)
}

function genMouseUp_WhiteboardMoveHandler(e){
    PositioningHandler.endDrag(e)
}