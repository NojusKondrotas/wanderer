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

function addNoteListeners(note){
    note.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
        
        selectedElement = note

        openNewContextMenu(e.clientX, e.clientY, npwcm)
    })

    note.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        if(StatesHandler.isWritingElement) return
        WhiteboardPositioningHandler.element_MouseDown(e, note)
    })

    note.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, note)
    })

    note.addEventListener('dblclick', (e) => {
        selectedElement = note
        if(!StatesHandler.isWritingElement){
            toggleQuillWritingMode(true, note.id)

            note.focus()

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

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.spellcheck = false

    createNewElement(container, newNote, getElementID(), xOffset, yOffset)
    addNoteListeners(newNote)

    document.getElementById(newNote.id).addEventListener("input", (e) => {
        updateQuillToolbarPosition(newNote)
    })

    createQuill(newNote.id, content)
    instantiateNoteResizingBorders(newNote)
}

function deleteNoteByID(container, noteID){
    deleteComponentByID(container, noteID)
}