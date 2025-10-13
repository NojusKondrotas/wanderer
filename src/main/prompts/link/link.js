initTitlebar();

(async () => {
  async function getWebviewLink() {
    return await window.wandererAPI.getLink()
  }

  const link = await getWebviewLink()
  document.getElementById('webview').setAttribute('src', link)
})()

function closeWindow(){
    window.wandererAPI.closeWindow()
}