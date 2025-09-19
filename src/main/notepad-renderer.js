const quill = initQuill('#notepad', window.wandererAPI.getQuillDelta())

document.getElementById('but').addEventListener('click', () => {
  window.wandererAPI.sendQuillDelta(quill.getContents())
  window.wandererAPI.closeWindow()
})