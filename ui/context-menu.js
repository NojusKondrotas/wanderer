const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-pad-context-menu')
const connectionContextMenu = document.getElementById('connection-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let selectedElement = null

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

let elementConnections = new Map()
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

    removeConnection(selectedElement)

    turnOffContextMenu()
})

document.getElementById('connect-element').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    if (!selectedElement) return

    const startNote = selectedElement

    let connections = elementConnections.get(selectedElement)
    if (!connections) {
        elementConnections.set(selectedElement, [])
        connections = elementConnections.get(selectedElement)
    }

    const div = document.createElement('div')
    div.classList.add('svg-container')

    drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const startRect = selectedElement.getBoundingClientRect()
    const initialBoardOffset = { x: boardOffset.x, y: boardOffset.y }

    const x1 = (startRect.left + startRect.width / 2)
    const y1 = (startRect.top + startRect.height / 2)

    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttribute("stroke", "#626464ff")
    path.setAttribute("stroke-width", pathWidth)
    path.setAttribute("fill", "none")
    path.style.pointerEvents = 'none'

    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    hitPath.setAttribute("stroke", "transparent")
    hitPath.setAttribute("stroke-width", pathWidth * 8)
    hitPath.setAttribute("fill", "none")
    hitPath.style.pointerEvents = 'stroke'


    drawnPath.appendChild(hitPath)
    drawnPath.appendChild(path)
    div.appendChild(drawnPath)

    const conn = {
        div,
        path,
        hitPath,
        startNote: selectedElement,
        endNote: null,
        shape: pathShape
    }
    hitPath.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()

        selectedElement = conn
        generateCircularContextMenu(e.clientX, e.clientY, connectionContextMenu, 360 / 2, 70, 90, 0, -10)
        concealContextMenu()
        openContextMenu(connectionContextMenu)
    })

    connections.push(conn)
    createNewElement(whiteboard, div)

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


        if(targetNote === startNote){
            document.removeEventListener('mousemove', mouseMoveHandler)
            document.removeEventListener('mousedown', mouseDownHandler)
            document.removeEventListener('mouseup', mouseUpHandler)


            connections.pop()
            drawnPath.remove()
            removeElement(whiteboard, div)
            
            return
        }

        console.log('Snapping note recipient:', targetNote)

        let localX = ev.clientX - dx
        let localY = ev.clientY - dy

        if (targetNote) {
            const targetRect = targetNote.getBoundingClientRect()

            localX = (targetRect.left + targetRect.width / 2) - svgRect.left
            localY = (targetRect.top + targetRect.height / 2) - svgRect.top

            conn.endNote = targetNote;
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
    for(const [el, connections] of elementConnections)
    {
        for (const conn of connections){
            const { startNote, endNote, path, hitPath, div } = conn
            const svgRect = div.getBoundingClientRect()

            let x1, y1, x2, y2;

            if (startNote){
                const startRect = startNote.getBoundingClientRect()
                x1 = (startRect.left + startRect.width / 2) - svgRect.left
                y1 = (startRect.top + startRect.height / 2) - svgRect.top
            }

            if (endNote){
                const endRect = endNote.getBoundingClientRect()
                x2 = (endRect.left + endRect.width / 2) - svgRect.left
                y2 = (endRect.top + endRect.height / 2) - svgRect.top
            }

            if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined){
                const updatedPath = updateConnectionPath(x1, y1, x2, y2, conn.shape)
                path.setAttribute('d', updatedPath)
                hitPath.setAttribute('d', updatedPath)
            }
        }
    }
}

function removeConnection(connRemove){
    console.log(connRemove)
    for (const [el, connections] of elementConnections){
        const index = connections.indexOf(connRemove)
        if (index !== -1){
            connections.splice(index, 1)

            connRemove.path.remove()
            connRemove.hitPath.remove()
            removeElement(whiteboard, connRemove.div)

            if (connections.length === 0){
                elementConnections.delete(el)
            }

            return
        }
    }
}