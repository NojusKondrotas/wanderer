const parentWhiteboard = document.getElementById('parent-whiteboard')
let componentID, componentIDEl

parentWhiteboard.addEventListener('mousedown', (e) => {
    genMouseDown_WhiteboardMoveHandler(e)
})

parentWhiteboard.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
})

parentWhiteboard.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})

parentWhiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if(isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
    turnOffContextMenu()

    openNewContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 162, -10, -10)
})