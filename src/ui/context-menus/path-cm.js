const pathContextMenu = document.getElementById('path-context-menu')

document.getElementById('acm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    openPathConnectionContextMenu(true)
})

document.getElementById('acm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    openPathConnectionContextMenu(false)
})

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePathByID(selectedPath.id)

    turnOffContextMenu()
})