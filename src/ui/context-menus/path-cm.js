const pathContextMenu = document.getElementById('path-context-menu')

const pathStartPoint = document.getElementById('path-end-0')
const pathEndPoint = document.getElementById('path-end-1')

pathStartPoint.addEventListener('mousedown', (e) => {
    disconnectPathStart(selectedPath)
    pathStartPoint.style.display = 'none'
    pathEndPoint.style.display = 'none'
})

pathEndPoint.addEventListener('mousedown', (e) => {
    disconnectPathEnd(selectedPath)
    pathStartPoint.style.display = 'none'
    pathEndPoint.style.display = 'none'
})

document.getElementById('acm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    pathStartPoint.style.left = `${selectedPath.startPosition.x}px`
    pathStartPoint.style.top = `${selectedPath.startPosition.y}px`
    pathEndPoint.style.left = `${selectedPath.endPosition.x}px`
    pathEndPoint.style.top = `${selectedPath.endPosition.y}px`

    pathStartPoint.style.display = 'inline'
    pathEndPoint.style.display = 'inline'

    concealContextMenu()
})

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePathByID(selectedPath.id)

    turnOffContextMenu()
})