const pathStartPoint = document.getElementById('path-end-0')
const pathEndPoint = document.getElementById('path-end-1')

function disconnectPathStart(path){
    path.startNoteID = null
}

function disconnectPathEnd(path){
    path.endNoteID = null
}

function disconnectConnectedPaths(elID){
    allPaths.forEach(path => {
        if(path.startNoteID === elID){
            path.startNoteID = null
        }else if(path.endNoteID === elID){
            path.endNoteID = null
        }
    })
}

function openPathDisconnectionContextMenu(){
    concealContextMenu()

    pathStartPoint.style.left = `${selectedPath.startPosition.x}px`
    pathStartPoint.style.top = `${selectedPath.startPosition.y}px`
    pathEndPoint.style.left = `${selectedPath.endPosition.x}px`
    pathEndPoint.style.top = `${selectedPath.endPosition.y}px`

    pathStartPoint.style.display = 'inline'
    pathEndPoint.style.display = 'inline'

    isContextMenuOpen = true
}