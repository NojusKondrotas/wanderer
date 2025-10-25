let dragStart = { x: 0, y: 0 }
let dragDiff = { x: 0, y: 0 }
let dragTotalStart = { x: 0, y: 0 }
let dragTotalDiff = { x: 0, y: 0 }
let dragAbsoluteTotalDiff = { x: 0, y: 0 }

function resetMouseDrag(ev){
    dragStart = { x: ev.screenX, y: ev.screenY }
    dragTotalStart = { x: ev.screenX, y: ev.screenY }
    dragDiff = { x: 0, y: 0 }
    dragTotalDiff = { x: 0, y: 0 }
    dragAbsoluteTotalDiff = { x: 0, y: 0 }
}

function updateMouseDrag(ev){
    dragDiff = {
        x: (dragStart.x - ev.screenX) / zoomFactor,
        y: (dragStart.y - ev.screenY) / zoomFactor
    }
    dragStart = {
        x: ev.screenX,
        y: ev.screenY
    }
    dragAbsoluteTotalDiff.x += Math.abs(dragDiff.x)
    dragAbsoluteTotalDiff.y += Math.abs(dragDiff.y)
}

function checkIfDraggedEnough(){
    return dragAbsoluteTotalDiff.x > 5 || dragAbsoluteTotalDiff.y > 5
}