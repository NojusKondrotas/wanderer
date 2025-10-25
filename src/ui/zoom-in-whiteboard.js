let zoomFactor = 1.0
let zoomStep = 1.4

function zoomInWhiteboard(){
    zoomFactor = Math.min(zoomFactor * zoomStep, 8)
    parentWhiteboard.style.transform = `scale(${zoomFactor})`
}

function zoomOutWhiteboard(){
    zoomFactor = Math.max(zoomFactor / zoomStep, 0.1)
    parentWhiteboard.style.transform = `scale(${zoomFactor})`
}