let totalElements = 2, totalPaths = 0

const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-pad-context-menu')
const pathContextMenu = document.getElementById('path-context-menu')
const titlebarContextMenu = document.getElementById('titlebar-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let selectedElement = null, selectedPath = null

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

let allPaths = new Array()
let drawnPath = null

const pathVisualShape = 'line', pathVisualWidth = '2'

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = radius * Math.cos(angleRad) + xOffset
        let y = radius * Math.sin(angleRad) + yOffset

        const offsetX = (Math.random() - 0.5) * 100 // -50..+50 px
        const offsetY = (Math.random() - 0.5) * 100

        option.style.transition = "none"
        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`

        option.offsetHeight

        option.style.transition = "transform 240ms ease, left 240ms ease, top 240ms ease"
        option.style.left = `${x}px`
        option.style.top = `${y}px`
    })
}

function concealContextMenu(){
    generalContextMenu.style.display = 'none'
    noteAndNotepadContextMenu.style.display = 'none'
    pathContextMenu.style.display = 'none'
    titlebarContextMenu.style.display = 'none'

    isContextMenuOpen = false
}

function turnOffContextMenu(){
    concealContextMenu()
    isContextMenuOpen = false
    selectedElement = null
    selectedPath = null
}

function revealContextMenu(contextMenuBlueprint){
    contextMenuBlueprint.style.display = 'block'
    isContextMenuOpen = true
}

function openNewContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    concealContextMenu()
    revealContextMenu(contextMenuBlueprint)
    contextMenuCenter = {x:centerX, y:centerY}
    generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset, yOffset)
}

function docMouseMove_ContextMenuHandler(e){
    if (!isContextMenuOpen) return

    Array.from(optionCtrls).forEach(ctrl => {
        const rect = ctrl.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))

        if (distance > 100) {
            ctrl.style.transform = 'translate(-50%, -50%) scale(1)'
            return
        }

        let factor
        if(distance < 20) factor = 1.2
        else{
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3)
            }

            let t = (distance - 20) / (100 - 20)
            t = Math.min(Math.max(t, 0), 1)

            factor = 1 + 0.2 * (1 - easeOutCubic(t))
        }
        ctrl.style.transform = `translate(-50%, -50%) scale(${factor})`
    })
}

document.getElementById('new-note').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNote(whiteboard, '', contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('copy-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)

    turnOffContextMenu()
})

document.getElementById('cut-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)
    
    selectedElement.remove() // fix null exception when updating path

    turnOffContextMenu()
})

document.getElementById('paste-note').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await readElementWandererClipboard()
    let {isHTML, parsedString} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(whiteboard, parsedString, contextMenuCenter.x, contextMenuCenter.y)

    Array.from(parsedString.children).forEach(child => {
        createNewElement(whiteboard, child, contextMenuCenter.x, contextMenuCenter.y)
    })
})

document.getElementById('delete-path').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePath(selectedPath)

    turnOffContextMenu()
})

document.getElementById('connect-element').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    concealContextMenu()
    if (!selectedElement) return

    const startNoteID = selectedElement.id

    const div = document.createElement('div')
    div.classList.add('svg-container')

    drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const startRect = selectedElement.getBoundingClientRect()
    const initialBoardOffset = { x: boardOffset.x, y: boardOffset.y }

    const x1 = contextMenuCenter.x//(startRect.left + startRect.width / 2)
    const y1 = contextMenuCenter.y//(startRect.top + startRect.height / 2)

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
        startOffset: {x: x1 - startRect.left, y: y1 - startRect.top},
        endOffset: null,
        shape: pathVisualShape
    }
    addPathListeners(path, hitPath)

    allPaths.push(path)

    let dragStart = null

    function drawInternal(x1, y1, x2, y2){
        const updatedPath = updatePathData(x1, y1, x2, y2, path.shape)
        pathVisual.setAttribute('d', updatedPath)
        hitPath.setAttribute('d', updatedPath)
    }

    function terminateDrawing(){
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mousedown', mouseDownHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
    }

    function removeLineInternal(){
        allPaths.pop()
        drawnPath.remove()
        removeElement(whiteboard, div)
    }

    function mouseMoveHandler(ev) {
        if (!dragStart) dragStart = { x: ev.clientX, y: ev.clientY }

        const dx = boardOffset.x - initialBoardOffset.x
        const dy = boardOffset.y - initialBoardOffset.y

        const localX = ev.clientX - dx
        const localY = ev.clientY - dy

        drawInternal(x1, y1, localX, localY)
    }

    function mouseDownHandler(ev) {
        mouseDown = true
        dragStart = { x: ev.clientX, y: ev.clientY }
    }

    function mouseUpHandler(ev) {
        const movedX = Math.abs(ev.clientX - dragStart.x)
        const movedY = Math.abs(ev.clientY - dragStart.y)
        let draggedEnough = movedX > 5 || movedY > 5
        dragStart = null

        const svgContainer = drawnPath.parentNode
        const svgRect = svgContainer.getBoundingClientRect()

        const elementsAtPoint = document.elementsFromPoint(ev.clientX, ev.clientY)

        let targetNote = null
        for (const el of elementsAtPoint) {
            if (el.classList?.contains('note') &&
                !el.closest('#general-context-menu') &&
                !el.closest('#note-and-pad-context-menu')
            ){
                targetNote = el
                break
            }
        }


        if(targetNote && targetNote.id === startNoteID){
            removeLineInternal()
            terminateDrawing()
            return
        }

        console.log('Snapping note recipient:', targetNote)

        let targetRect = targetNote ? targetNote.getBoundingClientRect() : null

        if(targetNote){
            path.endNoteID = targetNote.id

            path.endOffset = {
                x: ev.clientX - targetRect.left,
                y: ev.clientY - targetRect.top
            }
            draggedEnough = false
        }else{
            path.endNoteID = null
            path.endOffset = {
                x: ev.clientX - svgRect.left,
                y: ev.clientY - svgRect.top
            }
        }

        if (!draggedEnough) {
            terminateDrawing()
        }
    }


    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mousedown', mouseDownHandler)
    setTimeout(() => {
    document.addEventListener('mouseup', mouseUpHandler)
    }, 500)

})

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

function updatePathPosition(path){
    const { ID, pathVisualID, hitPathID, startNoteID, endNoteID, startOffset, endOffset, shape } = path
    const svgRect = document.getElementById(ID).getBoundingClientRect()

    let x1, y1, x2, y2
    
    if (startNoteID){
        const startRect = document.getElementById(startNoteID).getBoundingClientRect()
        x1 = (startRect.left + startOffset.x) - svgRect.left
        y1 = (startRect.top + startOffset.y) - svgRect.top
        // x1 = (startRect.left + startRect.width / 2) - svgRect.left
        // y1 = (startRect.top + startRect.height / 2) - svgRect.top
    }

    if (endNoteID){
        const endRect = document.getElementById(endNoteID).getBoundingClientRect()
        x2 = (endRect.left + endOffset.x) - svgRect.left
        y2 = (endRect.top + endOffset.y) - svgRect.top
        // x2 = (endRect.left + endRect.width / 2) - svgRect.left
        // y2 = (endRect.top + endRect.height / 2) - svgRect.top
    }else if(endOffset){
        x2 = endOffset.x
        y2 = endOffset.y
    }

    if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined){
        const updatedPath = updatePathData(x1, y1, x2, y2, shape)
        document.getElementById(pathVisualID).setAttribute('d', updatedPath)
        document.getElementById(hitPathID).setAttribute('d', updatedPath)
    }
}

function updateAllPathsPositions(){
    for (const path of allPaths){
        updatePathPosition(path)
    }
}

function deletePath(pathRemove){
    console.log(pathRemove)
    const index = allPaths.indexOf(pathRemove)
    if (index !== -1){
        allPaths.splice(index, 1)

        const pathVisual = document.getElementById(pathRemove.pathVisualID)
        const hitPath = document.getElementById(pathRemove.hitPathID)
        pathVisual.remove()
        hitPath.remove()
        removeElementByID(whiteboard, pathRemove.ID)

        return
    }
}

function addPathListeners(path, hitPath){
    hitPath.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('right clicked on hitPath')

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, pathContextMenu, 360 / 2, 70, 90, 0, -10)
    })
}