let quill
async function initNotepad() {
    const delta = await window.wandererAPI.loadQuillDelta()
    quill = initQuill('#notepad', delta)
}

initNotepad()
StatesHandler.isComponentNotepad = true

document.getElementById('but').addEventListener('click', () => {
    window.wandererAPI.saveQuillDelta(quill.getContents())
    window.wandererAPI.closeWindow()
})

window.wandererAPI.onTerminateWindow(() => {
    window.wandererAPI.saveQuillDelta(quill.getContents())
})