const quill = initQuill('#notepad', window.wandererAPI.loadQuillDelta())

document.getElementById('but').addEventListener('click', () => {
    window.wandererAPI.saveQuillDelta(quill.getContents())
    window.wandererAPI.closeWindow()
})

window.wandererAPI.onTerminateWindow(() => {
    window.wandererAPI.saveQuillDelta(quill.getContents())
})