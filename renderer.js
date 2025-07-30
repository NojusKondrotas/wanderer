const titlebar = document.getElementById('titlebar')
const whiteboard = document.getElementById('whiteboard')
const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-notepad-context-menu')
const optionsMenu = document.getElementById('global-configuration-menu')

let isDraggingBoard = false
let boardOffset = {x: 0, y:0}, boardOrigin = {x: 0, y: 0}
const elementOffsets = new WeakMap()

let selectedElement = null
let isDraggingElement = false
let tmp_elementOffset = {x: 0, y:0}, tmp_elementOrigin = {x: 0, y:0}

let isContextMenuOpen = false

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize;
        const angleRad = angleDeg * Math.PI / 180;

        let x = radius * Math.cos(angleRad) + xOffset;
        let y = radius * Math.sin(angleRad) + yOffset;

        option.style.left = `${x}px`;
        option.style.top = `${y}px`;
    });
}

Array.from(whiteboard.children).forEach(child => {
    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        selectedElement = child

        // const bodyRect = document.body.getBoundingClientRect(),
        //         elemRect = child.getBoundingClientRect(),
        //         offsetX   = elemRect.left - bodyRect.left,
        //         offsetY   = elemRect.top - bodyRect.top;
        generateCircularContextMenu(e.clientX, e.clientY, noteAndNotepadContextMenu, 90, 70, 0, 0, -34)

        generalContextMenu.style.display = 'none'
        noteAndNotepadContextMenu.style.display = 'block'
        isContextMenuOpen = true
    })
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    generateCircularContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 234, -10, -10)

    noteAndNotepadContextMenu.style.display = 'none'
    generalContextMenu.style.display = 'block'
    isContextMenuOpen = true
})

whiteboard.addEventListener('mousedown', (e) => {
    if(e.button !== 2){
        if(isContextMenuOpen){
            generalContextMenu.style.display = 'none'
            noteAndNotepadContextMenu.style.display = 'none'
            selectedElement = null
            isContextMenuOpen = false
            return;
        }
    }
})

document.getElementById('fullscreen-window').addEventListener('click', () => {
    window.wandererAPI.isFullscreen().then((isFull) => {
        if(isFull) window.wandererAPI.setFullscreen(false)
        else window.wandererAPI.setFullscreen(true)
    })
})

document.getElementById('maximize-window').addEventListener('click', () => {
    window.wandererAPI.isMaximized().then((isMax) => {
        if(isMax) window.wandererAPI.setMaximized(false)
        else window.wandererAPI.setMaximized(true)
    })
})

document.getElementById('close-window').addEventListener('click', () => window.wandererAPI.closeWindow())

document.getElementById('lock-titlebar').addEventListener('click', () => {
    window.wandererAPI.isTitlebarLocked().then((isLocked) => {
        if(isLocked) window.wandererAPI.toggleTitlebarLock(false)
        else window.wandererAPI.toggleTitlebarLock(true)
    })
})