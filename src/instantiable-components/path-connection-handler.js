const pathStartPoint = document.getElementById('path-end-0')
const pathEndPoint = document.getElementById('path-end-1')

function connectPathStart(path){
    StatesHandler.isDrawingPath = true
    selectedPath = path
    StatesHandler.isDrawingPathEnd = false

    suppressNextMouseUp = true
}

function connectPathEnd(path){
    StatesHandler.isDrawingPath = true
    selectedPath = path
    StatesHandler.isDrawingPathEnd = true

    suppressNextMouseUp = true
}

function disconnectPathStart(path){
    path.startNoteID = null
}

function disconnectPathEnd(path){
    path.endNoteID = null
}

pathStartPoint.addEventListener('mousedown', (e) => {
    if(StatesHandler.isConnecting) connectPathStart(selectedPath)
    else disconnectPathStart(selectedPath)
    concealContextMenu()
})

pathEndPoint.addEventListener('mousedown', (e) => {
    if(StatesHandler.isConnecting) connectPathEnd(selectedPath)
    else disconnectPathEnd(selectedPath)
    concealContextMenu()
})

function disconnectConnectedPaths(elID){
    allPaths.forEach(path => {
        if(path.startNoteID === elID){
            path.startNoteID = null
        }else if(path.endNoteID === elID){
            path.endNoteID = null
        }
    })
}

function openPathConnectionContextMenu(flag){
    concealContextMenu()

    pathStartPoint.style.left = `${selectedPath.startPosition.x}px`
    pathStartPoint.style.top = `${selectedPath.startPosition.y}px`
    pathEndPoint.style.left = `${selectedPath.endPosition.x}px`
    pathEndPoint.style.top = `${selectedPath.endPosition.y}px`

    pathStartPoint.style.display = 'inline'
    pathEndPoint.style.display = 'inline'

    StatesHandler.isContextMenuOpen = true

    StatesHandler.isConnecting = flag
}