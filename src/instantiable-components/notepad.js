function addNotepadListeners(notepad){
    notepad.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        
        selectedElement = notepad

        openNewContextMenu(e.clientX, e.clientY, elementContextMenu, 360 / 6, 90, 0, 0, -10)
    })

    notepad.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseDown(e, notepad)
    })

    notepad.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseUp(e, notepad)
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
            PositioningHandler.startDrag(e, false, false, true)
            document.body.style.cursor = (border === 'left' || border === 'right') ? 'ew-resize' : 'ns-resize'
        })

        borderDiv.addEventListener('mouseup', function(e) {
            PositioningHandler.endDrag(e)
        })
    })
}

function createNewNotepad(container, xOffset = 0, yOffset = 0){
    const newNotepad = document.createElement('div')
    newNotepad.classList.add('notepad')
    newNotepad.innerHTML = 'notepad'

    createNewElement(container, newNotepad, xOffset, yOffset)
    addNotepadListeners(newNotepad)
    
    //instantiateNoteResizingBorders(newNotepad)
}

function deleteNotepadByID(container, notepadID){
    deleteComponentByID(container, notepadID)
}