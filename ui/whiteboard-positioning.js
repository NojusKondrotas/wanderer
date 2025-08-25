const whiteboard = document.getElementById('whiteboard')

let isDraggingBoard = false
let boardOffset = {x: 0, y:0}, boardPrevPos = {x: 0, y: 0}, dragOrigin = {x:0, y:0}
let elementOffsets = new Map()

let isDraggingElement = false, isWritingElement = false
let tmp_elementOffset = {x: 0, y:0}, tmp_elementOrigin = {x: 0, y:0}

function updateElementPosition(el) {
    let elOffset = elementOffsets.get(el)

    let x = boardOffset.x + elOffset.x
    let y = boardOffset.y + elOffset.y

    el.style.transform = `translate(${x}px, ${y}px)`
}

function updateChildrenPositions(container){
    Array.from(container.children).forEach(child => {
        updateElementPosition(child)
    })
}

function docMouseDown_WhiteboardMoveHandler(e){
    if(e.button !== 2){
        if(isContextMenuOpen){
            turnOffContextMenu()
            return
        }

        isWritingElement = false
        Array.from(whiteboard.children).forEach((child) => {
            child.contentEditable = 'false'
        })

        isDraggingBoard = true
        handleKeybindGuideAppearance(false)

        boardPrevPos = {x:e.clientX, y:e.clientY}
        dragOrigin = {x:e.clientX, y:e.clientY}
    }
}

function docMouseMove_WhiteboardMoveHandler(e){
    if(isDraggingBoard){
        const dx = e.clientX - boardPrevPos.x
        const dy = e.clientY - boardPrevPos.y

        boardOffset.x += dx
        boardOffset.y += dy
        boardPrevPos = { x: e.clientX, y: e.clientY }
        updateChildrenPositions(whiteboard)
    }
    else if(isDraggingElement){
        const dx = e.clientX - tmp_elementOrigin.x
        const dy = e.clientY - tmp_elementOrigin.y

        elementOffsets.set(selectedElement, {x: tmp_elementOffset.x + dx, y: tmp_elementOffset.y + dy})

        updateElementPosition(selectedElement)
    }

    updateAllPathsPositions()
}

function docMouseUp_WhiteboardMoveHandler(e){
    selectedElement = null
    isDraggingElement = false

    isDraggingBoard = false
    handleKeybindGuideAppearance(true)
}