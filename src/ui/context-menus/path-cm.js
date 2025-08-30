const pathContextMenu = document.getElementById('path-context-menu')

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePath(selectedPath)

    turnOffContextMenu()
})