let allNotesContents = new Map()

let activeBorder = null

let largestNoteContainerID = 0, unusedNoteContainerIDs = new Array()

function getNoteContainerID(){
    if(unusedNoteContainerIDs.length !== 0)
        return unusedNoteContainerIDs.pop()
    else{
        ++largestNoteContainerID
        return `note-container-${largestNoteContainerID - 1}`
    }
}

function getEditableNote(noteID){
    const note = document.getElementById(noteID)
    const p = note.querySelector('p')
    return p
}

function toggleWritingMode(toggle = false, editableElContainerID){
    const editableElContainer = document.getElementById(editableElContainerID)
    const editableEl = getEditableNote(editableElContainerID)
    if(toggle){
        editableEl.style.userSelect = 'auto'
        editableEl.contentEditable = 'true'
        editableEl.focus()

        StatesHandler.isWritingElement = true
        selectedElement = editableElContainer
    }
    else{
        editableEl.contentEditable = 'false'
        editableEl.style.userSelect = 'none'
        
        StatesHandler.isWritingElement = false
        selectedElement = null
    }
}

function saveAllNotesContents(){
    document.querySelectorAll('.note-container').forEach(note => allNotesContents.set(note.id, document.getElementById(note.id).querySelector('p').textContent))
}

function reinstateAllNotesContents(){
    for(const [key, value] of allNotesContents){
        const el = document.getElementById(key)
        const p = el.querySelector('p')
        p.innerHTML = value
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

    newNote.addEventListener('keydown', (e) => {
        if(isCombo(keybinds[noteWriteFocusDown])){
            switchFocusToChild(newNote.id)
        }
        if(isCombo(keybinds[noteWriteFocusUp])){
            switchFocusToParent(newNote.id)
        }

        if(e.key === 'Enter'){
            e.preventDefault();
            const posParent = getAbsolutePosition(newNote);
            const childNote = createNewNote(parentWhiteboard, '', new Set([newNote.id]), new Set(), posParent.left + posParent.width / 2, posParent.top + posParent.height + 10);
            const posChild = getAbsolutePosition(childNote);
            createPath({ x: posParent.left + posParent.width / 2, y: posParent.top + posParent.height / 2 },
                { x: posChild.left + posChild.width / 2, y: posChild.top + posChild.height / 2 },
                newNote.id, childNote.id, false, false, false)
            switchFocus(newNote.id, childNote.id)
        }
    })
}

function reinstateAllNoteBorders(elements){
    for(let [key, value] of elements){
        const el = document.getElementById(key);
        instantiateResizingBorders(el);
    }
}

function createNewNote(container, content = '', parent_ids = new Set(), child_ids = new Set(), centerX = 0, centerY = 0){
    const newNote = document.createElement('div')
    const p = document.createElement('p')
    newNote.classList.add('note-container')
    p.id = getElementID()
    p.classList.add('note')
    p.spellcheck = false
    newNote.appendChild(p)

    createNewElement(container, newNote, getNoteContainerID(), centerX, centerY)
    instantiateHierarchy(newNote.id, parent_ids, child_ids)
    addNoteListeners(newNote)
    instantiateResizingBorders(newNote)
    allNotesContents.set(newNote.id, "")

    return newNote;
}

function createNewNoteLeftTopOffset(container, content = '', parent_ids = new Set(), child_ids = new Set(), offsetX = 0, offsetY = 0){
    const newNote = document.createElement('div')
    const p = document.createElement('p')
    newNote.classList.add('note-container')
    p.id = getElementID()
    p.classList.add('note')
    p.spellcheck = false
    newNote.appendChild(p)

    createNewElementLeftTopOffset(container, newNote, getNoteContainerID(), offsetX, offsetY)
    instantiateHierarchy(newNote.id, parent_ids, child_ids)
    addNoteListeners(newNote)
    instantiateResizingBorders(newNote);
    allNotesContents.set(newNote.id, "")

    return newNote
}

function deleteNoteByID(container, n_id){
    deleteComponentByID(container, n_id)
    allNotesContents.delete(n_id)
}