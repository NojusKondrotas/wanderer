function addNoteListeners(note){
    note.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        
        selectedElement = note

        openNewContextMenu(e.clientX, e.clientY, elementContextMenu, 360 / 6, 90, 0, 0, -10)
    })

    note.addEventListener('mousedown', (e) => {
        PositioningHandler.element_MouseDown(e, note)
    })

    note.addEventListener('mouseup', (e) => {
        PositioningHandler.element_MouseUp(e, note)
    })

    note.addEventListener('dblclick', (e) => {
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

    createNewElement(container, newNote, xOffset, yOffset)
    addNoteListeners(newNote)

    const quill = createQuill(newNote)
    configureQuill(newNote, content)

    console.log(contextMenuCenter.x, contextMenuCenter.y)
}

function disconnectConnectedPaths(elID){
    allPaths.forEach(path => {
        if(path.startNoteID === elID){
            path.startNoteID = null
        }else if(path.endNoteID === elID){
            path.endNoteID = null
        }
    })
}