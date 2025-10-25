let largestPathID = 0

let allPaths = new Map(), unusedPathIDs = new Array()
let selectedPath = null

const pathVisualShape = 'line', pathVisualWidth = '2'

let suppressNextMouseUp = false

function getPathID(){
    if(unusedPathIDs.length !== 0)
        return unusedPathIDs.pop()
    else{
        ++largestPathID
        return `path-${largestPathID - 1}`
    }
}

function createPath(mousePos, startX = 0, startY = 0){
    const div = document.createElement('div')
    div.classList.add('path-container')

    const boardSpaceMousePos = convertToRealWhiteboardCoords(mousePos.x, mousePos.y)
    const boardSpaceStart = convertToRealWhiteboardCoords(startX, startY)

    const drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const pathVisual = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    pathVisual.classList.add('path')
    pathVisual.setAttribute("stroke", "#626464ff")
    pathVisual.setAttribute("stroke-width", pathVisualWidth)
    pathVisual.setAttribute("fill", "none")
    pathVisual.style.pointerEvents = 'none'
    pathVisual.setAttribute("id", `${getPathID()}`)

    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    hitPath.setAttribute("stroke", "transparent")
    hitPath.setAttribute("stroke-width", pathVisualWidth * 8)
    hitPath.setAttribute("fill", "none")
    hitPath.style.pointerEvents = 'stroke'
    hitPath.setAttribute("id", `${getPathID()}`)

    drawnPath.appendChild(hitPath)
    drawnPath.appendChild(pathVisual)
    div.appendChild(drawnPath)
    parentWhiteboard.appendChild(div)
    div.id = `${getElementID()}`
    div.style.visibility = 'visible'

    const path = {
        ID: div.id,
        pathVisualID: pathVisual.id,
        hitPathID: hitPath.id,
        startNoteID: selectedElement ? selectedElement.id : null,
        endNoteID: null,
        startPosition: { ...boardSpaceStart },
        endPosition: { ...boardSpaceMousePos },
        shape: pathVisualShape
    }
    configurePath(path)
    allPaths.set(div.id, path)
    selectedPath = path
    suppressNextMouseUp = true
    StatesHandler.isDrawingPath = true
    StatesHandler.isDrawingPathEnd = true
    updatePathPosition(path, path.startPosition, path.endPosition)
    return path
}

function addPathListeners(path){
    document.getElementById(path.hitPathID).addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('right clicked on hitPath')
        if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, acm)
    })
}

function updatePathData(x1, y1, x2, y2, shape = 'line') {
    let pathData
    switch(shape){
        case 'line':
            pathData = `M ${x1} ${y1} L ${x2} ${y2}`
            return pathData
        case 'curve':
            const dx = (x2 - x1) / 2
            pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
            return pathData
        case 'right-angle':
            pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
            return pathData
        case 'zigzag':
            const midX = (x1 + x2) / 2
            pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
            return pathData
    }
}

function updatePathPosition(path, startPosition, endPosition){
    const updatedPath = updatePathData(startPosition.x, startPosition.y, endPosition.x, endPosition.y, path.shape)
    document.getElementById(path.pathVisualID).setAttribute('d', updatedPath)
    document.getElementById(path.hitPathID).setAttribute('d', updatedPath)
}

function terminatePathDrawing(ev, elID){
    if(StatesHandler.isDrawingPathEnd)
        selectedPath.endNoteID = elID
    else
        selectedPath.startNoteID = elID
    if(StatesHandler.isDrawingPathEnd)
        selectedPath.endPosition = convertToRealWhiteboardCoords(ev.clientX, ev.clientY)
    else
        selectedPath.startPosition = convertToRealWhiteboardCoords(ev.clientX, ev.clientY)
    StatesHandler.isDrawingPath = false
    selectedPath = null
}

function deletePathByID(pathToRemoveID){
    if(allPaths.has(pathToRemoveID)){
        const pathToRemove = allPaths.get(pathToRemoveID)
        allPaths.delete(pathToRemoveID)

        unusedPathIDs.push(pathToRemove.pathVisualID)
        unusedPathIDs.push(pathToRemove.hitPathID)

        const pathVisual = document.getElementById(pathToRemove.pathVisualID)
        const hitPath = document.getElementById(pathToRemove.hitPathID)
        pathVisual.remove()
        hitPath.remove()
        deleteComponentByID(parentWhiteboard, pathToRemoveID)
    }
}