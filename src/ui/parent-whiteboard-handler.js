const wbMovement = document.getElementById('wb-movement')
const wbZoom = document.getElementById('wb-zoom')

// parentWhiteboard.addEventListener('contextmenu', (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)

//     openNewContextMenu(e.clientX, e.clientY, gcm)
// })

wbMovement.addEventListener('mousedown', (e) => {
    genMouseDown_WhiteboardMoveHandler(e)
})

wbMovement.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})