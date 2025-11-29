let editor
async function initNotepad() {
    const contents = await window.wandererAPI.loadEditorContents()
    editorContents = initEditor('#notepad', contents) // unimplemented function
}

initNotepad()
StatesHandler.isComponentNotepad = true

document.getElementById('but').addEventListener('click', () => {
    window.wandererAPI.saveEditorContents(editor.getContents())
    window.wandererAPI.closeWindow()
})

window.wandererAPI.onTerminateWindow(() => {
    window.wandererAPI.saveEditorContents(editor.getContents())
})

function initEditor(dom_id, contents = ''){

}