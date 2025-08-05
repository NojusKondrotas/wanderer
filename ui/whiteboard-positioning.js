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