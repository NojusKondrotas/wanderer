const elementContextMenu = document.getElementById('element-context-menu')

document.getElementById('npwcm-copy').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)

    turnOffContextMenu()
})

document.getElementById('npwcm-cut').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)
    
    removeElementByID(whiteboard, selectedElement.id)

    turnOffContextMenu()
})

document.getElementById('npwcm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    concealContextMenu()
    if (!selectedElement) return

    path = createPath()
    PositioningHandler.isDrawingPath = true
    selectedPath = path

    suppressNextMouseUp = true
})