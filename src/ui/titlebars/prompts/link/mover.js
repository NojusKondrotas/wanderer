const titlebarMoverCtrlFrame = document.getElementById('frame-mover-titlebar')

titlebarMoverCtrlFrame.addEventListener('mousedown', (e) => {
    e.stopPropagation()
    titlebarMoverCtrlFrame.blur()
    mouseDown_LinkMoveHandler(e)
})