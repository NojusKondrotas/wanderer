const pathStartPoint = document.getElementById('path-end-0')
const pathMiddlePoint = document.getElementById('path-end-1')
const pathEndPoint = document.getElementById('path-end-2')
const pathStartPointInner = document.getElementById('path-end-inner-0')
const pathMiddlePointInner = document.getElementById('path-end-inner-1')
const pathEndPointInner = document.getElementById('path-end-inner-2')
const timeoutACCM = 40;

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
    e.stopPropagation();
});
pathStartPoint.addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
pathStartPoint.addEventListener('click', (e) => {
    e.stopPropagation()

    if(StatesHandler.isConnecting) connectPathStart(selectedPath)
    else disconnectPathStart(selectedPath)
    closePathConnectionContextMenu()
})

pathMiddlePoint.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
pathMiddlePoint.addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
pathMiddlePoint.addEventListener('click', (e) => {
    e.stopPropagation()
    
    disconnectPathStart(selectedPath)
    disconnectPathEnd(selectedPath)
    closePathConnectionContextMenu()
})

pathEndPoint.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
pathEndPoint.addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
pathEndPoint.addEventListener('click', (e) => {
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
    const pathMiddle = getPathMiddle(selectedPath);
    console.log(pathMiddle)
    const middlePos = convertFromWhiteboardSpace(pathMiddle.x, pathMiddle.y)
    const endPos = convertFromWhiteboardSpace(selectedPath.endPosition.x, selectedPath.endPosition.y)
    pathStartPoint.style.left = `${startPos.x}px`
    pathStartPoint.style.top = `${startPos.y}px`
    pathEndPoint.style.left = `${endPos.x}px`
    pathEndPoint.style.top = `${endPos.y}px`
    pathStartPoint.style.display = 'flex'
    pathEndPoint.style.display = 'flex'
    if(!isConnecting){
        pathMiddlePoint.style.left = `${middlePos.x}px`
        pathMiddlePoint.style.top = `${middlePos.y}px`
        pathMiddlePoint.style.display = 'flex'
    }

    requestAnimationFrame(() => {
        pathStartPoint.style.transform = 'translate(-50%, -50%) scale(1)';
        pathEndPoint.style.transform = 'translate(-50%, -50%) scale(1)';
        pathStartPointInner.style.transform = 'scale(1)';
        pathEndPointInner.style.transform = 'scale(1)';
        if(!isConnecting){
            pathMiddlePoint.style.transform = 'translate(-50%, -50%) scale(1)';
            pathMiddlePointInner.style.transform = 'scale(1)';
        }
    });

    StatesHandler.isContextMenuOpen = true
    StatesHandler.isConnecting = isConnecting
}

function closePathConnectionContextMenu(){
    pathStartPoint.style.transform = 'translate(-50%, -50%) scale(0)'
    pathMiddlePoint.style.transform = 'translate(-50%, -50%) scale(0)';
    pathEndPoint.style.transform = 'translate(-50%, -50%) scale(0)'
    pathStartPointInner.style.transform = 'scale(0)'
    pathMiddlePointInner.style.transform = 'scale(0)';
    pathEndPointInner.style.transform = 'scale(0)'
    setTimeout(() => {
        pathStartPoint.style.display = 'none'
        pathMiddlePoint.style.display = 'none'
        pathEndPoint.style.display = 'none'
    }, timeoutACCM);

    StatesHandler.isContextMenuOpen = false
    StatesHandler.isConnecting = false
}