const whiteboard = document.getElementById('whiteboard')

whiteboard.addEventListener('mousedown', (e) => {
    genMouseDown_WhiteboardMoveHandler(e)
})

whiteboard.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
})

whiteboard.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    openNewContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 162, -10, -10)
})