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

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, childCount, radius, angleOffset){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * (360 / childCount);
        const angleRad = angleDeg * Math.PI / 180;

        let x = radius * Math.cos(angleRad);
        let y = radius * Math.sin(angleRad);
        if(childCount === 3){
            y -= 25
        }
        if(childCount === 5){
            x -= 10
            y -= 10
        }

        option.style.left = `${x}px`;
        option.style.top = `${y}px`;
    });
}

Array.from(whiteboard.children).forEach(child => {
    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        selectedElement = child

        const bodyRect = document.body.getBoundingClientRect(),
                elemRect = child.getBoundingClientRect(),
                offsetX   = elemRect.left - bodyRect.left,
                offsetY   = elemRect.top - bodyRect.top;
        generateCircularContextMenu(offsetX + elemRect.width / 2, offsetY + elemRect.height / 2, noteAndNotepadContextMenu, 3, 85, 90)

        generalContextMenu.style.display = 'none'
        noteAndNotepadContextMenu.style.display = 'block'
        isContextMenuOpen = true
    })
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    generateCircularContextMenu(e.clientX, e.clientY, generalContextMenu, 5, 85, 234)

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