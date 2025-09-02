const pathContextMenu = document.getElementById('path-context-menu')

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePathByID(selectedPath.id)

    turnOffContextMenu()
})