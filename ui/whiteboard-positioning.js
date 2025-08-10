const whiteboard = document.getElementById('whiteboard')

let isDraggingBoard = false
let boardOffset = {x: 0, y:0}, boardOrigin = {x: 0, y: 0}, dragOrigin = {x:0, y:0}
const elementOffsets = new WeakMap()

let isDraggingElement = false, isWritingElement = false
let tmp_elementOffset = {x: 0, y:0}, tmp_elementOrigin = {x: 0, y:0}

function updateElementPosition(el) {
    const elOffset = elementOffsets.get(el)
    if (!elOffset) elementOffsets.set(el, { x: 0, y: 0 })

    let x = boardOffset.x + elOffset.x
    let y = boardOffset.y + elOffset.y

    el.style.transform = `translate(${x}px, ${y}px)`
}

document.addEventListener('mousedown', (e) => {
    if(e.button !== 2){
        if(isContextMenuOpen){
            turnOffContextMenu()
            return;
        }

        isWritingElement = false
        Array.from(whiteboard.children).forEach((child) => {
            child.contentEditable = 'false'
        })

        isDraggingBoard = true
        boardOrigin = {x:e.clientX, y:e.clientY}
        dragOrigin = {x:e.clientX, y:e.clientY}
    }
})

document.addEventListener('mousemove', (e) => {
    if(isDraggingBoard){
        const dx = e.clientX - boardOrigin.x
        const dy = e.clientY - boardOrigin.y

        boardOffset.x += dx
        boardOffset.y += dy
        boardOrigin = { x: e.clientX, y: e.clientY }
        Array.from(whiteboard.children).forEach(child => {
            updateElementPosition(child)
        })
    }
    else if(isDraggingElement){
        const dx = e.clientX - tmp_elementOrigin.x
        const dy = e.clientY - tmp_elementOrigin.y

        elementOffsets.set(selectedElement, {x: tmp_elementOffset.x + dx, y: tmp_elementOffset.y + dy})

        updateElementPosition(selectedElement)
    }

    for (const conn of allConnections) {
        const { startNote, endNote, path, hitPath, div } = conn
        const svgRect = div.getBoundingClientRect()

        let x1, y1, x2, y2;

        if (startNote) {
            const startRect = startNote.getBoundingClientRect()
            x1 = (startRect.left + startRect.width / 2) - svgRect.left
            y1 = (startRect.top + startRect.height / 2) - svgRect.top
        }

        if (endNote) {
            const endRect = endNote.getBoundingClientRect();
            x2 = (endRect.left + endRect.width / 2) - svgRect.left
            y2 = (endRect.top + endRect.height / 2) - svgRect.top
        }

        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
            const updatedPath = updateConnectionPath(x1, y1, x2, y2, conn.shape)
            path.setAttribute('d', updatedPath)
            hitPath.setAttribute('d', updatedPath)
        }
    }
})

document.addEventListener('mouseup', (e) => {
    if(selectedElement){
        selectedElement = null
        isDraggingElement = false
    }

    if(e.clientX - dragOrigin.x <= 5 || e.clientY - dragOrigin.y <= 5)
        isDrawingConnection = false
    else isDrawingConnection = true

    isDraggingBoard = false
})