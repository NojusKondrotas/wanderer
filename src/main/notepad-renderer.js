const quill = initQuill('#notepad', window.wandererAPI.quillDeltaRetrieve())

document.getElementById('but').addEventListener('click', () => {
    window.wandererAPI.closeWindow()
})

window.wandererAPI.quillDeltaRequest(() => {
  const contents = quill.getContents()
  window.wandererAPI.quillDeltaResponse(contents)
})