function configureNoteToolbar(noteToolbar){
    noteToolbar.addEventListener('mousedown', (e) => { e.stopPropagation(); StatesHandler.isNoteToolbarEdit = 2 })
}