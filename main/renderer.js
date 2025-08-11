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

        concealContextMenu()
        openContextMenu(noteAndNotepadContextMenu)
    })

    child.addEventListener('mousedown', (e) => {
        if(e.button !== 2){
            e.stopPropagation()
            if(isWritingElement) return

            if(isContextMenuOpen){
                turnOffContextMenu()
                return
            }
            
            toggleWritingMode(false, child)

            tmp_elementOrigin = {x:e.clientX, y:e.clientY}
            tmp_elementOffset = elementOffsets.get(child)

            selectedElement = child
        }
    })

    child.addEventListener('dblclick', (e) => {
        toggleWritingMode(true, child)

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

function removeElement(container, el){
    container.removeChild(el)
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.textContent = content

    createNewElement(container, newNote, xOffset, yOffset)
}

Array.from(whiteboard.children).forEach(child => {configureNewChild(child); elementOffsets.set(child, { x: 0, y: 0 })})

function toggleWritingMode(boolean = false, editableEl = null){
    if(boolean){
        isWritingElement = true
        isDraggingElement = false
        if(editableEl) editableEl.contentEditable = 'true'
    }
    else{
        isWritingElement = false
        isDraggingElement = true
        if(editableEl) editableEl.contentEditable = 'false'
    }
}