const parentWhiteboard = document.getElementById('parent-whiteboard')

// parentWhiteboard.addEventListener('contextmenu', (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)

//     openNewContextMenu(e.clientX, e.clientY, gcm)
// })

parentWhiteboard.addEventListener('mousedown', (e) => {
    genMouseDown_WhiteboardMoveHandler(e)
})

parentWhiteboard.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})