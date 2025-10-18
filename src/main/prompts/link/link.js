initTitlebar();

StatesHandler.isPromptLink = true

(async () => {
  async function getWebviewLink() {
    return await window.wandererAPI.getLink()
  }

  const link = await getWebviewLink()
  document.getElementById('webview').setAttribute('src', link)
})()

const cover = document.getElementById('cover')

cover.addEventListener('mousemove', (e) => {
  console.log('hi')
    mouseMove_LinkMoveHandler(e)
})

cover.addEventListener('mousedown', (e) => {
    mouseDown_LinkMoveHandler(e)
})

cover.addEventListener('mouseup', (e) => {
    mouseUp_LinkMoveHandler(e)
})

function closeWindow(){
    window.wandererAPI.closeWindow()
}