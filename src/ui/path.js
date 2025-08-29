let totalPaths = 0

let allPaths = new Array()
let drawnPath = null, selectedPath = null

const pathVisualShape = 'line', pathVisualWidth = '2'

let suppressNextMouseUp = false

function createPath(){
    const div = document.createElement('div')
    div.classList.add('svg-container')

    drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const x1 = contextMenuCenter.x
    const y1 = contextMenuCenter.y

    const pathVisual = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    pathVisual.setAttribute("stroke", "#626464ff")
    pathVisual.setAttribute("stroke-width", pathVisualWidth)
    pathVisual.setAttribute("fill", "none")
    pathVisual.style.pointerEvents = 'none'
    pathVisual.setAttribute("id", `path-${totalPaths++}`)

    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    hitPath.setAttribute("stroke", "transparent")
    hitPath.setAttribute("stroke-width", pathVisualWidth * 8)
    hitPath.setAttribute("fill", "none")
    hitPath.style.pointerEvents = 'stroke'
    hitPath.setAttribute("id", `path-${totalPaths++}`)

    drawnPath.appendChild(hitPath)
    drawnPath.appendChild(pathVisual)
    div.appendChild(drawnPath)
    createNewElement(whiteboard, div)

    const path = {
        ID: div.id,
        pathVisualID: pathVisual.id,
        hitPathID: hitPath.id,
        startNoteID: selectedElement.id,
        endNoteID: null,
        startPosition: {x: x1, y: y1},
        endPosition: null,
        shape: pathVisualShape
    }
    addPathListeners(path, hitPath)
    allPaths.push(path)
    selectedPath = path
    return path
}

function addPathListeners(path){
    document.getElementById(path.hitPathID).addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('right clicked on hitPath')

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, pathContextMenu, 360 / 2, 70, 90, 0, -10)
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

function deletePath(pathRemove){
    const index = allPaths.indexOf(pathRemove)
    if (index !== -1){
        allPaths.splice(index, 1)

        const pathVisual = document.getElementById(pathRemove.pathVisualID)
        const hitPath = document.getElementById(pathRemove.hitPathID)
        pathVisual.remove()
        hitPath.remove()
        removeElementByID(whiteboard, pathRemove.ID)

        totalPaths -= 2

        return
    }
}