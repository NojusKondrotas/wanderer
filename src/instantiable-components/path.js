let largestPathID = 0

let allPaths = new Map(), unusedPathIDs = new Array()
let selectedPath = null

const pathVisualShape = 'line', pathVisualWidth = '2'

function getPathID(){
    if(unusedPathIDs.length !== 0)
        return unusedPathIDs.pop()
    else{
        ++largestPathID
        return `path-${largestPathID - 1}`
    }
}

function createPath(container, startPos, endPos, startElement_id = null, endElement_id = null, isDrawing = false, isHierarchicalStart = false, isHierarchicalEnd = false){
    const div = document.createElement('div')
    div.classList.add('path-container')

    const boardSpaceStartPos = convertToWhiteboardSpace(startPos.x, startPos.y)
    const boardSpaceEndPos = convertToWhiteboardSpace(endPos.x, endPos.y)

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
    container.appendChild(div)
    div.id = `${getElementID()}`
    div.style.visibility = 'visible'

    const path = {
        ID: div.id,
        pathVisualID: pathVisual.id,
        hitPathID: hitPath.id,
        startNoteID: startElement_id,
        endNoteID: endElement_id,
        originStartPos: { ...boardSpaceStartPos },
        originEndPos: { ...boardSpaceEndPos },
        startPosition: { ...boardSpaceStartPos },
        endPosition: { ...boardSpaceEndPos },
        isHierarchicalStart,
        isHierarchicalEnd,
        shape: pathVisualShape
    }
    configurePath(path)
    allPaths.set(div.id, path)
    selectedPath = path
    StatesHandler.isDrawingPath = isDrawing
    StatesHandler.isDrawingPathEnd = isDrawing
    updatePathPosition(path, path.startPosition, path.endPosition)
    return path
}

function addPathListeners(path){
    document.getElementById(path.hitPathID).addEventListener('contextmenu', (e) => {
        e.preventDefault()
        if(StatesHandler.isDrawingPath){
            return;
        }
        e.stopPropagation()
        console.log('right clicked on hitPath')
        if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, acm)
    })
}

function getPathMiddle(path) {
    const pathEl = document.getElementById(path.pathVisualID);
    const len = pathEl.getTotalLength();
    return pathEl.getPointAtLength(len / 2);
}

function addPathArrows(x1, y1, x2, y2){
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const size = 8
    const a1 = angle + Math.PI / 6
    const a2 = angle - Math.PI / 6

    const ax1 = x2 - size * Math.cos(a1)
    const ay1 = y2 - size * Math.sin(a1)
    const ax2 = x2 - size * Math.cos(a2)
    const ay2 = y2 - size * Math.sin(a2)

    const arrow = ` M ${ax1} ${ay1} L ${x2} ${y2} L ${ax2} ${ay2}`

    return arrow
}

function updatePathData(x1, y1, x2, y2, isStartPoint = false, isEndPoint = false, shape = 'line') {
    let pathData, startPrevX, startPrevY, endPrevX, endPrevY
    switch(shape){
        case 'line':
            pathData = `M ${x1} ${y1} L ${x2} ${y2}`
            startPrevX = x2, startPrevY = y2
            endPrevX = x1, endPrevY = y1
            break
        case 'curve':
            const dx = (x2 - x1) / 2
            pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
            startPrevX = x1 + dx, startPrevY = y1
            endPrevX = x2 - dx, endPrevY = y2
            break
        case 'right-angle':
            pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
            startPrevX = x1, startPrevY = y2
            endPrevX = x2, endPrevY = y2
            break
        case 'zigzag':
            const midX = (x1 + x2) / 2
            pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
            startPrevX = midX, startPrevY = y1
            endPrevX = midX, endPrevY = y2
            break
    }

    let arrowStart, arrowEnd
    if(isStartPoint)
        arrowStart = addPathArrows(x1, y1, startPrevX, startPrevY)
    if(isEndPoint)
        arrowEnd = addPathArrows(x2, y2, endPrevX, endPrevY)

    if(arrowStart == null){
        if(arrowEnd == null)
            return pathData
        return pathData + arrowEnd
        }
    if(arrowEnd == null)
        return pathData + arrowStart
    return pathData + arrowStart + arrowEnd
}

function updatePathPosition(path, startPosition, endPosition){
    const updatedPath = updatePathData(startPosition.x, startPosition.y, endPosition.x, endPosition.y, path.isHierarchicalStart, path.isHierarchicalEnd, path.shape)
    document.getElementById(path.pathVisualID).setAttribute('d', updatedPath)
    document.getElementById(path.hitPathID).setAttribute('d', updatedPath)
}

function terminatePathDrawing(ev, elID){
    if(StatesHandler.isDrawingPathEnd){
        selectedPath.endNoteID = elID;
        selectedPath.endPosition = convertToWhiteboardSpace(ev.clientX, ev.clientY);
        selectedPath.originEndPos = convertToWhiteboardSpace(ev.clientX, ev.clientY);
    }else{
        selectedPath.startNoteID = elID;
        selectedPath.startPosition = convertToWhiteboardSpace(ev.clientX, ev.clientY);
        selectedPath.originStartPos = convertToWhiteboardSpace(ev.clientX, ev.clientY);
    }

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
        deleteComponentByID(wbZoom, pathToRemoveID)
    }
}