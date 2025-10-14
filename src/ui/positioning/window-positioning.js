let isDraggingWindow = false
let isResizingWindow = false
let windowDimensions = { width: 0, height: 0 }
let windowCornerOffset = { x: 0, y: 0 }

function resetWindowDrag(ev){
    isDraggingWindow = false
    isResizingWindow = false
    windowDimensions = { width: window.outerWidth, height: window.outerHeight }
    windowCornerOffset = {
        x: ev.screenX - window.screenX,
        y: ev.screenY - window.screenY
    }
}

function moveWindow(){
    const newX = dragStart.x - windowCornerOffset.x
    const newY = dragStart.y - windowCornerOffset.y

    window.wandererAPI.moveWindow(
        newX,
        newY,
        windowDimensions.width,
        windowDimensions.height
    )
}

function resizeWindow(){
    const dx = -dragDiff.x
    const dy = -dragDiff.y

    let { width, height } = windowDimensions
    let newX = window.screenX
    let newY = window.screenY

    width += dx
    height += dy

    window.wandererAPI.moveWindow(newX, newY, width, height)

    windowDimensions = { width, height }
}