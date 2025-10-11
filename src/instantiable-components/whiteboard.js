function addWhiteboardListeners(whiteboard){
    whiteboard.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        
        selectedElement = whiteboard

        openNewContextMenu(e.clientX, e.clientY, elementContextMenu, 360 / 6, 90, 0, 0, -10)
    })

    whiteboard.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseDown(e, whiteboard)
    })

    whiteboard.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseUp(e, whiteboard)
    })

    whiteboard.addEventListener('dblclick', (e) => {
        if(isWritingElement) return

        window.wandererAPI.openWhiteboard(whiteboard.id)
    })
}

async function createNewWhiteboard(container, xOffset = 0, yOffset = 0){
    const id = await window.wandererAPI.addWhiteboard()

    const newWhiteboard = document.createElement('div')
    newWhiteboard.classList.add('whiteboard')
    newWhiteboard.textContent = id

    createNewElement(container, newWhiteboard, id, xOffset, yOffset)
    addWhiteboardListeners(newWhiteboard)
    
    //instantiateNoteResizingBorders(newWhiteboard)
}

function deleteWhiteboardByID(container, whiteboardID){
    deleteComponentByID(container, whiteboardID)
}