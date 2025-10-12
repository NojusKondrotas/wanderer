function addWhiteboardListeners(whiteboard){
    whiteboard.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
        
        selectedElement = whiteboard

        openNewContextMenu(e.clientX, e.clientY, npwcm)
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
        if(StatesHandler.isWritingElement) return

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