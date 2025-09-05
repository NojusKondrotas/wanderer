let largestPathID = 0

let allPaths = new Array(), unusedPathIDs = new Array()
let isDrawingPath = false
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

function createPath(startX = 0, startY = 0){
    const div = document.createElement('div')
    div.classList.add('path-container')

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
    whiteboard.appendChild(div)
    div.id = `${getElementID()}`
    div.style.visibility = 'visible'

    const path = {
        ID: div.id,
        pathVisualID: pathVisual.id,
        hitPathID: hitPath.id,
        startNoteID: selectedElement ? selectedElement.id : null,
        endNoteID: null,
        startPosition: {x: startX, y: startY},
        endPosition: null,
        shape: pathVisualShape
    }
    configurePath(path)
    allPaths.push(path)
    selectedPath = path
    suppressNextMouseUp = true
    isDrawingPath = true
    return path
}

function addPathListeners(path){
    document.getElementById(path.hitPathID).addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('right clicked on hitPath')

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, pathContextMenu, 360 / 3, 70, 90, 0, -10)
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

function initiatePathDrawing(ev, elID){

}

function terminatePathDrawing(ev, elID){
    selectedPath.endNoteID = elID
    const boundingClientRect = document.getElementById(selectedPath.ID).getBoundingClientRect()
    const mousePos = PositioningHandler.getAbsoluteMousePos(ev, boundingClientRect)
    selectedPath.endPosition = mousePos
    isDrawingPath = false
    selectedPath = null
}

function deletePathByID(pathToRemoveID){
    const pathToRemove = document.getElementById(pathToRemoveID)
    const index = allPaths.indexOf(pathToRemove)
    if (index !== -1){
        allPaths.splice(index, 1)

        unusedPathIDs.push(pathToRemove.pathVisualID)
        unusedPathIDs.push(pathToRemove.hitPathID)

        const pathVisual = document.getElementById(pathToRemove.pathVisualID)
        const hitPath = document.getElementById(pathToRemove.hitPathID)
        pathVisual.remove()
        hitPath.remove()
        deleteComponentByID(whiteboard, pathToRemove.ID)

        return
    }
}