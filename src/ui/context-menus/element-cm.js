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
    
    deleteComponentByID(whiteboard, selectedElement.id)

    turnOffContextMenu()
})

document.getElementById('npwcm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deleteNoteByID(whiteboard, selectedElement.id)

    turnOffContextMenu()
})

document.getElementById('npwcm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    concealContextMenu()
    if (!selectedElement) return

    createPath({ x: e.clientX, y: e.clientY }, contextMenuCenter.x, contextMenuCenter.y)
})

document.getElementById('npwcm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    disconnectConnectedPaths(selectedElement.id)

    turnOffContextMenu()
})