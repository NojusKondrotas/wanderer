const pathContextMenu = document.getElementById('path-context-menu')
const acm = {
    blueprint : pathContextMenu,
    angleSize : 360 / pathContextMenu.children.length,
    radius : 70,
    angleOffset : 90,
    xOffset : 0,
    yOffset : -10
}

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