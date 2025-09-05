const pathContextMenu = document.getElementById('path-context-menu')

pathStartPoint.addEventListener('mousedown', (e) => {
    disconnectPathStart(selectedPath)
    concealContextMenu()
})

pathEndPoint.addEventListener('mousedown', (e) => {
    disconnectPathEnd(selectedPath)
    concealContextMenu()
})

document.getElementById('acm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    openPathDisconnectionContextMenu()
})

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePathByID(selectedPath.id)

    turnOffContextMenu()
})