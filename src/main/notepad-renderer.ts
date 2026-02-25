import { AppStates } from "../runtime/states-handler.js"

let editor, editorContents
async function initNotepad() {
    const contents = await window.wandererAPI.loadEditorContents() as string
    editorContents = initEditor('#notepad', contents) // unimplemented function
}

initNotepad()
AppStates.isComponentNotepad = true

document.getElementById('but')!.addEventListener('click', () => {
    window.wandererAPI.saveEditorContents(editor.getContents())
    window.wandererAPI.closeWindow()
})

window.wandererAPI.onTerminateWindow(() => {
    window.wandererAPI.saveEditorContents(editor.getContents())
})

function initEditor(dom_id, contents = ''){

}