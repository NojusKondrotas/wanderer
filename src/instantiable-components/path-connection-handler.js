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
    e.stopPropagation()

    if(StatesHandler.isConnecting) connectPathStart(selectedPath)
    else disconnectPathStart(selectedPath)
    closePathConnectionContextMenu()
})

pathEndPoint.addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    if(StatesHandler.isConnecting) connectPathEnd(selectedPath)
    else disconnectPathEnd(selectedPath)
    closePathConnectionContextMenu()
})

function disconnectConnectedPaths(elID){
    for(let [key, value] of allPaths){
        if(value.startNoteID === elID){
            value.startNoteID = null
        }else if(value.endNoteID === elID){
            value.endNoteID = null
        }
    }
}

function openPathConnectionContextMenu(isConnecting = false){
    forgetContextMenus()

    const startPos = convertFromWhiteboardSpace(selectedPath.startPosition.x, selectedPath.startPosition.y)
    const endPos = convertFromWhiteboardSpace(selectedPath.endPosition.x, selectedPath.endPosition.y)
    pathStartPoint.style.left = `${startPos.x}px`
    pathStartPoint.style.top = `${startPos.y}px`
    pathEndPoint.style.left = `${endPos.x}px`
    pathEndPoint.style.top = `${endPos.y}px`

    pathStartPoint.style.display = 'inline'
    pathEndPoint.style.display = 'inline'

    StatesHandler.isContextMenuOpen = true
    StatesHandler.isConnecting = isConnecting
}

function closePathConnectionContextMenu(){
    pathStartPoint.style.display = 'none'
    pathEndPoint.style.display = 'none'

    StatesHandler.isContextMenuOpen = false
    StatesHandler.isConnecting = false
}