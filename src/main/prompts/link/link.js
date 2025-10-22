StatesHandler.isPromptLink = true;
isWindowClosing = false;

(async () => {
  async function getWebviewLink() {
    return await window.wandererAPI.getLink()
  }

  const link = await getWebviewLink()
  document.getElementById('webview').setAttribute('src', link)
})()

LinkPositioningHandler.cover.addEventListener('mousemove', (e) => {
  console.log('hi')
    mouseMove_LinkMoveHandler(e)
})

LinkPositioningHandler.cover.addEventListener('mousedown', (e) => {
    mouseDown_LinkMoveHandler(e)
})

LinkPositioningHandler.cover.addEventListener('mouseup', (e) => {
    mouseUp_LinkMoveHandler(e)
})

LinkPositioningHandler.cover.style.display = 'none'

function closeWindow(){
    isWindowClosing = true
    window.wandererAPI.closeWindow()
}

window.addEventListener("beforeunload", () => {
    if(!isWindowClosing) closeWindow()
})