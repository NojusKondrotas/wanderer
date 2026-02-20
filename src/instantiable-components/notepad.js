function addNotepadListeners(notepad){
    notepad.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)
        
        selectedElement = notepad

        openNewContextMenu(e.clientX, e.clientY, ecm)
    })

    notepad.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseDown(e, notepad)
    })

    notepad.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, notepad)
    })

    notepad.addEventListener('dblclick', (e) => {
        if(StatesHandler.isWritingElement) return

        window.wandererAPI.openNotepad(notepad.id)
    })
}

async function createNewNotepad(container, xOffset = 0, yOffset = 0){
    const id = await window.wandererAPI.addNotepad()
    
    const newNotepad = document.createElement('div')
    newNotepad.classList.add('notepad')
    newNotepad.textContent = id

    createNewElement(container, newNotepad, id, xOffset, yOffset)
    addNotepadListeners(newNotepad)
    instantiateResizingBorders(newNotepad);
}

function deleteNotepadByID(container, notepadID){
    deleteComponentByID(container, notepadID, []);
}