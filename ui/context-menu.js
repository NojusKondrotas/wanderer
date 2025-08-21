let totalElements = 2, totalPaths = 0

const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-pad-context-menu')
const connectionContextMenu = document.getElementById('connection-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let selectedElement = null, selectedLine = null

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

let elementConnections = new Array()
let drawnPath = null

const pathShape = 'zigzag', pathWidth = '2'

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = radius * Math.cos(angleRad) + xOffset
        let y = radius * Math.sin(angleRad) + yOffset

        option.style.left = `${x}px`
        option.style.top = `${y}px`
    })
}

function concealContextMenu(){
    generalContextMenu.style.display = 'none'
    noteAndNotepadContextMenu.style.display = 'none'
    connectionContextMenu.style.display = 'none'
}

function turnOffContextMenu(){
    concealContextMenu()
    isContextMenuOpen = false
    selectedElement = null
    selectedLine = null
}

function openContextMenu(contextMenuBlueprint){
    contextMenuBlueprint.style.display = 'block'
    isContextMenuOpen = true
}

document.addEventListener('mousemove', (e) => {
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
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    generateCircularContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 234, -10, -10)
    contextMenuCenter = {x:e.clientX, y:e.clientY}

    turnOffContextMenu()
    openContextMenu(generalContextMenu)
})

document.getElementById('new-note').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNote(whiteboard, '', contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('copy-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    text = IDClipboardContent(selectedElement.outerHTML)

    navigator.clipboard.writeText(text)

    turnOffContextMenu()
})

document.getElementById('cut-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    text = IDClipboardContent(selectedElement.outerHTML)

    navigator.clipboard.writeText(text)
    selectedElement.remove()

    turnOffContextMenu()
})

document.getElementById('paste-note').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await navigator.clipboard.readText()

    let {isHTML, parsedString} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(whiteboard, parsedString, contextMenuCenter.x, contextMenuCenter.y)

    Array.from(parsedString.children).forEach(child => {
        createNewElement(whiteboard, child, contextMenuCenter.x, contextMenuCenter.y)
    })
})

document.getElementById('remove-connection').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    removeConnection(selectedLine)

    turnOffContextMenu()
})

document.getElementById('connect-element').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    if (!selectedElement) return

    const startNoteID = selectedElement.id

    const div = document.createElement('div')
    div.classList.add('svg-container')

    drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const startRect = selectedElement.getBoundingClientRect()
    const initialBoardOffset = { x: boardOffset.x, y: boardOffset.y }

    const x1 = contextMenuCenter.x//(startRect.left + startRect.width / 2)
    const y1 = contextMenuCenter.y//(startRect.top + startRect.height / 2)

    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttribute("stroke", "#626464ff")
    path.setAttribute("stroke-width", pathWidth)
    path.setAttribute("fill", "none")
    path.style.pointerEvents = 'none'
    path.setAttribute("id", `path-${totalPaths++}`)

    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    hitPath.setAttribute("stroke", "transparent")
    hitPath.setAttribute("stroke-width", pathWidth * 8)
    hitPath.setAttribute("fill", "none")
    hitPath.style.pointerEvents = 'stroke'
    hitPath.setAttribute("id", `path-${totalPaths++}`)

    drawnPath.appendChild(hitPath)
    drawnPath.appendChild(path)
    div.appendChild(drawnPath)
    createNewElement(whiteboard, div)

    const conn = {
        divID: div.id,
        pathID: path.id,
        hitPathID: hitPath.id,
        startNoteID: selectedElement.id,
        endNoteID: null,
        startOffset: {x: x1 - startRect.left, y: y1 - startRect.top},
        endOffset: null,
        shape: pathShape
    }
    hitPath.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()

        selectedLine = conn
        generateCircularContextMenu(e.clientX, e.clientY, connectionContextMenu, 360 / 2, 70, 90, 0, -10)
        concealContextMenu()
        openContextMenu(connectionContextMenu)
    })

    elementConnections.push(conn)

    let dragStart = null
    let mouseDown = false

    function mouseMoveHandler(ev) {
        if (!dragStart) dragStart = { x: ev.clientX, y: ev.clientY }

        const dx = boardOffset.x - initialBoardOffset.x
        const dy = boardOffset.y - initialBoardOffset.y

        const localX = ev.clientX - dx
        const localY = ev.clientY - dy

        const updatedPath = updateConnectionPath(x1, y1, localX, localY, conn.shape)
        path.setAttribute('d', updatedPath)
        hitPath.setAttribute('d', updatedPath)
    }

    function mouseDownHandler(ev) {
        mouseDown = true
        dragStart = { x: ev.clientX, y: ev.clientY }
    }

    function mouseUpHandler(ev) {
        const movedX = Math.abs(ev.clientX - dragStart.x)
        const movedY = Math.abs(ev.clientY - dragStart.y)
        let draggedEnough = movedX > 5 || movedY > 5

        const dx = boardOffset.x - initialBoardOffset.x
        const dy = boardOffset.y - initialBoardOffset.y

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


        if(targetNote.id === startNoteID){
            document.removeEventListener('mousemove', mouseMoveHandler)
            document.removeEventListener('mousedown', mouseDownHandler)
            document.removeEventListener('mouseup', mouseUpHandler)


            elementConnections.pop()
            drawnPath.remove()
            removeElement(whiteboard, div)
            
            return
        }

        console.log('Snapping note recipient:', targetNote)

        let localX = ev.clientX - dx
        let localY = ev.clientY - dy
        const targetRect = targetNote.getBoundingClientRect()

        if (targetNote) {
            // const targetRect = targetNote.getBoundingClientRect()

            // localX = (targetRect.left + targetRect.width / 2) - svgRect.left
            // localY = (targetRect.top + targetRect.height / 2) - svgRect.top
            localX = (ev.clientX - targetRect.left) + targetRect.left - svgRect.left
            localY = (ev.clientY - targetRect.top) + targetRect.top - svgRect.top

            conn.endNoteID = targetNote.id;
            draggedEnough = false
        }
        else {
            localX = ev.clientX - svgRect.left
            localY = ev.clientY - svgRect.top
        }

        const updatedPath = updateConnectionPath(x1, y1, localX, localY, conn.shape)
        path.setAttribute('d', updatedPath)
        hitPath.setAttribute('d', updatedPath)

        if (!draggedEnough) {
            document.removeEventListener('mousemove', mouseMoveHandler)
            document.removeEventListener('mousedown', mouseDownHandler)
            document.removeEventListener('mouseup', mouseUpHandler)

            conn.endOffset = {
                x: ev.clientX - targetRect.left,
                y: ev.clientY - targetRect.top
            }
        }
    }


    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mousedown', mouseDownHandler)
    setTimeout(() => {
    document.addEventListener('mouseup', mouseUpHandler)
    }, 500)

})

function updateConnectionPath(x1, y1, x2, y2, shape = 'line') {
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

function moveConnections(){
    for (const conn of elementConnections){
        const { divID, pathID, hitPathID, startNoteID, endNoteID, startOffset, endOffset, shape } = conn
        const svgRect = document.getElementById(divID).getBoundingClientRect()

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
        }

        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined){
            const updatedPath = updateConnectionPath(x1, y1, x2, y2, shape)
            document.getElementById(pathID).setAttribute('d', updatedPath)
            document.getElementById(hitPathID).setAttribute('d', updatedPath)
        }
    }
}

function removeConnection(connRemove){
    console.log(connRemove)
    const index = elementConnections.indexOf(connRemove)
    if (index !== -1){
        elementConnections.splice(index, 1)

        const path = document.getElementById(connRemove.pathID)
        const hitPath = document.getElementById(connRemove.hitPathID)
        path.remove()
        hitPath.remove()
        removeElementByID(whiteboard, connRemove.divID)

        return
    }
}