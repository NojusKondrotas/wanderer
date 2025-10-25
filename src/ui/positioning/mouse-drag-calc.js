let dragStart = { x: 0, y: 0 }
let dragDiff = { x: 0, y: 0 }
let dragTotalStart = { x: 0, y: 0 }
let dragTotalDiff = { x: 0, y: 0 }
let dragAbsoluteTotalDiff = { x: 0, y: 0 }

function resetMouseDrag(ev){
    const boardSpace = getRealWhiteboardCoords(ev.clientX, ev.clientY)

    dragStart = boardSpace
    dragTotalStart = boardSpace
    dragDiff = { x: 0, y: 0 }
    dragTotalDiff = { x: 0, y: 0 }
    dragAbsoluteTotalDiff = { x: 0, y: 0 }
}

function updateMouseDrag(ev){
    const boardSpace = getRealWhiteboardCoords(ev.clientX, ev.clientY)

    dragDiff = {
        x: dragStart.x - boardSpace.x,
        y: dragStart.y - boardSpace.y
    }
    dragStart = boardSpace
    dragAbsoluteTotalDiff.x += Math.abs(dragDiff.x)
    dragAbsoluteTotalDiff.y += Math.abs(dragDiff.y)
}

function checkIfDraggedEnough(){
    return dragAbsoluteTotalDiff.x > 5 || dragAbsoluteTotalDiff.y > 5
}