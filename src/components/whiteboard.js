const whiteboard = document.getElementById('whiteboard')

whiteboard.addEventListener('mousedown', (e) => {
    docMouseDown_WhiteboardMoveHandler(e)
})

whiteboard.addEventListener('mousemove', (e) => {
    docMouseMove_WhiteboardMoveHandler(e)
    docMouseMove_ContextMenuHandler(e)
})

whiteboard.addEventListener('mouseup', (e) => {
    docMouseUp_WhiteboardMoveHandler(e)
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    openNewContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 162, -10, -10)
})