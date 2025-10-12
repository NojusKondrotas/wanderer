const elementContextMenu = document.getElementById('element-context-menu')
const npwcm = {
    blueprint : elementContextMenu,
    angleSize : 360 / elementContextMenu.children.length,
    radius : 90,
    angleOffset : 0,
    xOffset : 0,
    yOffset : -10
}

document.getElementById('npwcm-copy').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    copy(selectedElement)

    turnOffContextMenu()
})

document.getElementById('npwcm-cut').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    copy(selectedElement)
    
    deleteComponentByID(parentWhiteboard, selectedElement.id)

    turnOffContextMenu()
})

document.getElementById('npwcm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deleteNoteByID(parentWhiteboard, selectedElement.id)

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