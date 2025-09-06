let largestQlEditorID = 0, unusedQlEditorIDs = new Array()

let allQlEditors = new Array(), isEditing = false

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
        if(isWritingElement) return
        
        selectedElement = note

        openNewContextMenu(e.clientX, e.clientY, elementContextMenu, 360 / 6, 90, 0, 0, -10)
    })

    note.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseDown(e, note)
    })

    note.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        PositioningHandler.element_MouseUp(e, note)
    })

    note.addEventListener('dblclick', (e) => {
        if(isWritingElement) return
        selectedElement = note
        toggleQuillWritingMode(true, note)

        setTimeout(() => {
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
        }, 0)
    })
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.spellcheck = false

    createNewElement(container, newNote, xOffset, yOffset)
    addNoteListeners(newNote)

    document.getElementById(newNote.id).addEventListener("input", (e) => {
        updateQuillToolbarPosition(newNote)
    })

    const quill = createQuill(newNote)
    configureQuill(newNote, content)
    const editor = newNote.querySelector('.ql-editor')
    quillToolbar = document.querySelector('.ql-toolbar')
    quillToolbar.addEventListener('mousedown', (e) => isQuillToolbarEdit = true)
    let id = getQlEditorID()
    editor.id = id
    allQlEditors.push(id)
}

function deleteNoteByID(container, noteID){
    const editorID = document.getElementById(noteID).querySelector('.ql-editor').id
    
    const index = allQlEditors.indexOf(editorID)
    if (index !== -1){
        allQlEditors.splice(index, 1)

        unusedQlEditorIDs.push(editorID)
    }

    deleteComponentByID(container, noteID)
}