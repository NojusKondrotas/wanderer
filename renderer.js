const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')
const whiteboard = document.getElementById('whiteboard')
const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-notepad-context-menu')
const optionsMenu = document.getElementById('global-configuration-menu')

let isDraggingBoard = false
let boardOffset = {x: 0, y:0}, boardOrigin = {x: 0, y: 0}
const elementOffsets = new WeakMap()

let selectedElement = null
let isDraggingElement = false, isWritingElement = false
let tmp_elementOffset = {x: 0, y:0}, tmp_elementOrigin = {x: 0, y:0}

let isTitlebarLocked = false

let isContextMenuOpen = false

let wasNewElementAdded = false

function configureNewChild(child){
    const wbRect = whiteboard.getBoundingClientRect()
        
    child.contentEditable = 'false'
    child.style.userSelect = 'none'
    const rect = child.getBoundingClientRect()
    elementOffsets.set(child, {x: rect.left - wbRect.left, y: rect.top - wbRect.top})

    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        selectedElement = child

        generateCircularContextMenu(e.clientX, e.clientY, noteAndNotepadContextMenu, 360 / 5, 60, -18, 0, -10)

        generalContextMenu.style.display = 'none'
        noteAndNotepadContextMenu.style.display = 'block'
        isContextMenuOpen = true
    })

    child.addEventListener('mousedown', (e) => {
        if(e.button !== 2){
            e.stopPropagation()
            if(isWritingElement) return

            if(isContextMenuOpen){
                generalContextMenu.style.display = 'none'
                noteAndNotepadContextMenu.style.display = 'none'
                selectedElement = null
                isContextMenuOpen = false
                return;
            }
            
            child.contentEditable = 'false'
            isWritingElement = false

            tmp_elementOrigin = {x:e.clientX, y:e.clientY}
            tmp_elementOffset = elementOffsets.get(child)

            isDraggingElement = true
            selectedElement = child
        }
    })

    child.addEventListener('dblclick', (e) => {
        child.contentEditable = 'true'

        setTimeout(() => {
            child.focus()

            const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
            range = document.createRange()
            range.setStart(pos.offsetNode, pos.offset)
            range.collapse(true)

            if (range) {
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
            }
        }, 0)

        isWritingElement = true
        isDraggingElement = false
    })
}

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

function updateElementPosition(el) {
    const elOffset = elementOffsets.get(el)
    const x = boardOffset.x + elOffset.x
    const y = boardOffset.y + elOffset.y

    el.style.transform = `translate(${x}px, ${y}px)`
}

Array.from(whiteboard.children).forEach(child => configureNewChild(child))

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

        isWritingElement = false
        Array.from(whiteboard.children).forEach((child) => {
            child.contentEditable = 'false'
        })

        isDraggingBoard = true
        boardOrigin = {x:e.clientX, y:e.clientY}
    }
})

whiteboard.addEventListener('mousemove', (e) => {
    if(isDraggingBoard){
        const dx = e.clientX - boardOrigin.x
        const dy = e.clientY - boardOrigin.y

        boardOffset.x += dx
        boardOffset.y += dy
        boardOrigin = { x: e.clientX, y: e.clientY }
        Array.from(whiteboard.children).forEach(child => {
            updateElementPosition(child)
        })
    }
    else if(isDraggingElement){
        const dx = e.clientX - tmp_elementOrigin.x
        const dy = e.clientY - tmp_elementOrigin.y

        elementOffsets.set(selectedElement, {x: tmp_elementOffset.x + dx, y: tmp_elementOffset.y + dy})

        updateElementPosition(selectedElement)
    }
})

document.addEventListener('mouseup', () => {
    if(selectedElement){
        selectedElement = null
        isDraggingElement = false
    }

    isDraggingBoard = false
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

function toggleTitlebarLock(){
    if(isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        isTitlebarLocked = true
    }
}

document.getElementById('new-note').addEventListener('click', (e) => {
    const wbRect = whiteboard.getBoundingClientRect()

    const newNote = document.createElement('div')
    newNote.classList.add('note')
    
    const relativeX = e.clientX - wbRect.left - boardOffset.x
    const relativeY = e.clientY - wbRect.top - boardOffset.y

    elementOffsets.set(newNote, {x: relativeX, y: relativeY})
    
    whiteboard.appendChild(newNote)

    updateElementPosition(newNote)

    configureNewChild(newNote)
})

document.getElementById('copy').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(selectedElement.outerHTML)
})