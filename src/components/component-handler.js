let largestElementID = 0, unusedElementIDs = new Array()

let selectedElement = null

let elementPositions = new Map()

let isWritingElement = false

function getElementID(){
    if(unusedElementIDs.length !== 0)
        return unusedElementIDs.pop()
    else{
        ++largestElementID
        return `el-${largestElementID - 1}`
    }
}

function configureNewChild(child){
    if(child.classList.contains('note')){
        child.contentEditable = 'false'
        child.style.userSelect = 'none'

        addNoteListeners(child)
    }
}

function createNewElement(container, el, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpaceX = centerX - rect.width / 2
    const boardSpaceY = centerY - rect.height / 2

    el.id = `${getElementID()}`
    elementPositions.set(el.id, { x: boardSpaceX, y: boardSpaceY })
    configureNewChild(el)

    updateElementPositionByID(el.id)

    el.style.visibility = 'visible'
}

function removeElementByID(container, elID){
    container.removeChild(document.getElementById(elID))
    unusedElementIDs.push(elID)

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