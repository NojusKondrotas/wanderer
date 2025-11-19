let largestQlEditorID = 0, unusedQlEditorIDs = new Array()

let activeBorder = null

function getQlEditorID(){
    if(unusedQlEditorIDs.length !== 0)
        return unusedQlEditorIDs.pop()
    else{
        ++largestQlEditorID
        return `editor-${largestQlEditorID - 1}`
    }
}

function addNoteListeners(newNote){
    newNote.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)
        
        selectedElement = newNote

        openNewContextMenu(e.clientX, e.clientY, npwcm)
    })

    newNote.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        if(StatesHandler.isWritingElement) return
        WhiteboardPositioningHandler.element_MouseDown(e, newNote)
    })

    newNote.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, newNote)
    })

    newNote.addEventListener('dblclick', (e) => {
        selectedElement = newNote
        if(!StatesHandler.isWritingElement){
            toggleWritingMode(true, newNote.id)

            newNote.focus()

            const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
            range = document.createRange()
            range.setStart(pos.offsetNode, pos.offset)
            range.collapse(true)

            if (range) {
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
            }
        }
    })
}

function reinstateAllNoteBorders(elements){
    for(let [key, value] of elements){
        const el = document.getElementById(key)
        if(el.classList.contains('note'))
            instantiateNoteResizingBorders(el)
    }
}

function instantiateNoteResizingBorders(note){
    const borders = ['right', 'left']
    borders.forEach(border => {
        const borderDiv = document.createElement('div')
        borderDiv.classList.add(`note-border`, `note-border-${border}`)
        note.appendChild(borderDiv)

        borderDiv.addEventListener('mousedown', function(e) {
            e.stopPropagation()
            this.isResizing = true
            activeBorder = border
            selectedElement = note
            WhiteboardPositioningHandler.startDrag(e, false, false, true)
            document.body.style.cursor = 'ew-resize'
        })

        borderDiv.addEventListener('mouseup', function(e) {
            WhiteboardPositioningHandler.endDrag(e)
        })
    })
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('p')
    newNote.classList.add('note')
    newNote.spellcheck = false

    createNewElement(container, newNote, getElementID(), xOffset, yOffset)

    addNoteListeners(newNote)
}

function deleteNoteByID(container, noteID){
    deleteComponentByID(container, noteID)
}