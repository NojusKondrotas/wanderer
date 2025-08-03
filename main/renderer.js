const optionsMenu = document.getElementById('global-configuration-menu')

function configureNewChild(child){
    if(!child.classList.contains('note')) return
    child.contentEditable = 'false'
    child.style.userSelect = 'none'

    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        selectedElement = child

        generateCircularContextMenu(e.clientX, e.clientY, noteAndNotepadContextMenu, 360 / 5, 70, -18, 0, -10)
        contextMenuCenter = {x:e.clientX, y:e.clientY}

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

function createNewElement(container, el, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpaceX = centerX - boardOffset.x - rect.width / 2
    const boardSpaceY = centerY - boardOffset.y - rect.height / 2

    elementOffsets.set(el, { x: boardSpaceX, y: boardSpaceY })
    configureNewChild(el)

    updateElementPosition(el)

    el.style.visibility = 'visible'
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.textContent = content

    createNewElement(container, newNote, xOffset, yOffset)
}

Array.from(whiteboard.children).forEach(child => {configureNewChild(child); elementOffsets.set(child, { x: 0, y: 0 })})