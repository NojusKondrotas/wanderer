let allNotes = new Map()

let activeNoteToolbar = null

function toggleWritingMode(toggle = false, editableElID){
    const editableEl = document.getElementById(editableElID)
    if(toggle){
        editableEl.style.userSelect = 'auto'
        editableEl.contentEditable = 'true'
        editableEl.focus()

        StatesHandler.isWritingElement = true
        selectedElement = editableEl
    }
    else{
        editableEl.contentEditable = 'false'
        editableEl.style.userSelect = 'none'
        
        StatesHandler.isWritingElement = false
        selectedElement = null
    }
}

function configureNoteToolbar(noteToolbar){
    noteToolbar.addEventListener('mousedown', (e) => { e.stopPropagation(); StatesHandler.isNoteToolbarEdit = 2 })
}

function configureNoteEditor(n_id){
    allNotes.set(n_id, "")
}

function deleteNoteEditor(n_id){
    allNotes.delete(n_id)
}

function saveAllNotes(){
    document.querySelectorAll('.note').forEach(note => allNotes.set(note.id, document.getElementById(note.id).textContent))
}

function reinstateAllNotes(){
    for(const [key, value] of allNotes){
        const el = document.getElementById(key)
        el.innerHTML = value
    }
}