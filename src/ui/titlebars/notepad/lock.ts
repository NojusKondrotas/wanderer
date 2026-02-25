import { titlebarToggleTitlebarLock } from "../titlebar.js"

const titlebarLockCtrlFrame = document.getElementById('frame-lock-titlebar')!

titlebarLockCtrlFrame.addEventListener('click', (e) => {
    e.stopPropagation()
    titlebarLockCtrlFrame.blur()
    titlebarToggleTitlebarLock()
})