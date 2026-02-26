import "../../../runtime/states-handler.js"
import "../../../ui/titlebars/prompts/link/titlebar.js"
import "../../../ui/keybinds.js"
import "../../../ui/zoom-whiteboard.js"
import "../../../ui/positioning/mouse-drag-calc.js"
import "../../../ui/positioning/window-positioning.js"
import "../../../ui/positioning/link-positioning.js"

import { AppStates } from "../../../runtime/states-handler.js";
import { LinkPositioningHandler, mouseDown_LinkMoveHandler, mouseMove_LinkMoveHandler, mouseUp_LinkMoveHandler } from "../../../ui/positioning/link-positioning.js";

AppStates.isPromptLink = true;
let isWindowClosing = false;

(async () => {
  async function getWebviewLink() {
    return await window.wandererAPI.getLink()
  }

  const link = await getWebviewLink()
  document.getElementById('webview')!.setAttribute('src', link)
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