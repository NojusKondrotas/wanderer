let zoomFactor = 1.0
const zoomStep = 1.4
const boardOffset = { x: 0, y: 0 }

function zoomWhiteboard(mousePos, zoomIn = false){
    const oldZoom = zoomFactor
    if(zoomIn)
        zoomFactor = Math.min(zoomFactor * zoomStep, 8)
    else zoomFactor = Math.max(zoomFactor / zoomStep, 0.1)

    const scaleChange = zoomFactor / oldZoom

    boardOffset.x = mousePos.x - scaleChange * (mousePos.x - boardOffset.x)
    boardOffset.y = mousePos.y - scaleChange * (mousePos.y - boardOffset.y)

    parentWhiteboard.style.transformOrigin = '0 0'
    parentWhiteboard.style.transform = `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${zoomFactor})`
}

function convertToRealWhiteboardCoords(x, y) {
    return {
        x: (x - boardOffset.x) / zoomFactor,
        y: (y - boardOffset.y) / zoomFactor
    }
}

function convertFromWhiteboardSpace(x, y){
    return {
        x: x * zoomFactor + boardOffset.x,
        y: y * zoomFactor + boardOffset.y,
    }
}