function addNotepadListeners(notepad){
    notepad.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)
        
        selectedElement = notepad

        openNewContextMenu(e.clientX, e.clientY, npwcm)
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

function reinstateAllNotepadBorders(elements){
    for(let [key, value] of elements){
        const el = document.getElementById(key)
        if(el.classList.contains('note'))
            instantiateNoteResizingBorders(el)
    }
}

function instantiateNotepadResizingBorders(note){
    const borders = ['top', 'right', 'bottom', 'left']
    borders.forEach(border => {
        const borderDiv = document.createElement('div')
        borderDiv.classList.add(`note-border`, `note-border-${border}`)
        note.appendChild(borderDiv)

        // Add resizing logic
        borderDiv.addEventListener('mousedown', function(e) {
            e.stopPropagation()
            this.isResizing = true
            activeBorder = border
            selectedElement = note
            WhiteboardPositioningHandler.startDrag(e, false, false, true)
            document.body.style.cursor = (border === 'left' || border === 'right') ? 'ew-resize' : 'ns-resize'
        })

        borderDiv.addEventListener('mouseup', function(e) {
            WhiteboardPositioningHandler.endDrag(e)
        })
    })
}

async function createNewNotepad(container, xOffset = 0, yOffset = 0){
    const id = await window.wandererAPI.addNotepad()
    
    const newNotepad = document.createElement('div')
    newNotepad.classList.add('notepad')
    newNotepad.textContent = id

    createNewElement(container, newNotepad, id, xOffset, yOffset)
    addNotepadListeners(newNotepad)
    
    //instantiateNoteResizingBorders(newNotepad)
}

function deleteNotepadByID(container, notepadID){
    deleteComponentByID(container, notepadID)
}