const optionsMenu = document.getElementById('global-configuration-menu')

window.addEventListener('DOMContentLoaded', async () => {
    const savedData = await window.wandererAPI.loadState()

    if (savedData && Object.keys(savedData).length > 0){
        totalElements = savedData.totalElements
        totalPaths = savedData.totalPaths

        elementPositions = new Map(savedData.elementPositions.map(e => [e.id, {x: e.x, y: e.y}]))
        allPaths = savedData.allPaths

        isTitlebarLocked = savedData.isTitlebarLocked
        isFullscreen = savedData.isFullscreen

        window.wandererAPI.setFullscreen(isFullscreen)

        Array.from(whiteboard.children).forEach(child => addNoteListeners(child))
        allPaths.forEach(path => addPathListeners(path))

        console.log(totalElements)
        console.log(totalPaths)
        console.log(elementPositions)
        console.log(allPaths)
        console.log(isTitlebarLocked)
        console.log(isFullscreen)
    }
})

function addNoteListeners(child){
    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        
        selectedElement = child

        openNewContextMenu(e.clientX, e.clientY, noteAndNotepadContextMenu, 360 / 5, 70, -18, 0, -10)
    })

    child.addEventListener('mousedown', (e) => {
        PositioningHandler.element_MouseDown(e, child)
    })

    child.addEventListener('mouseup', (e) => {
        PositioningHandler.element_MouseUp(e, child)
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

function configureNewChild(child){
    if(!child.classList.contains('note')) return
    child.contentEditable = 'false'
    child.style.userSelect = 'none'

    addNoteListeners(child)
}

function createNewElement(container, el, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpaceX = centerX - rect.width / 2
    const boardSpaceY = centerY - rect.height / 2

    el.id = `el-${totalElements++}`
    elementPositions.set(el.id, { x: boardSpaceX, y: boardSpaceY })
    configureNewChild(el)

    updateElementPositionByID(el.id)

    el.style.visibility = 'visible'
}

function removeElementByID(container, elID){
    container.removeChild(document.getElementById(elID))
    --totalElements

    allPaths.forEach(path => {
        if(path.startNoteID === elID)
            path.startNoteID = null
        if(path.endNoteID === elID)
            path.endNoteID = null
    })

    if (elementPositions.has(elID)) {
        elementPositions.delete(elID)
    }
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.textContent = content

    createNewElement(container, newNote, xOffset, yOffset)
}

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

document.addEventListener('mousedown', (e) => {
    docMouseDown_WhiteboardMoveHandler(e)
})

document.addEventListener('mousemove', (e) => {
    docMouseMove_WhiteboardMoveHandler(e)
    docMouseMove_ContextMenuHandler(e)
})

document.addEventListener('mouseup', (e) => {
    docMouseUp_WhiteboardMoveHandler(e)
})

whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    openNewContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 234, -10, -10)
})

window.addEventListener('beforeunload', () => {
    window.wandererAPI.saveHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])

    window.wandererAPI.saveState({
        totalElements,
        totalPaths,
        elementPositions: elementPositionsArr,
        allPaths,
        isTitlebarLocked,
        isFullscreen
    })
})

window.wandererAPI.openTitlebarContextMenu((mousePos, boundsOffset) => {
    openNewContextMenu(mousePos.x - boundsOffset.x, mousePos.y - boundsOffset.y, titlebarContextMenu, 360 / 5, 85, 234, -10, -10)
})