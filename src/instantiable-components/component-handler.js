let largestElementID = 0, unusedElementIDs = new Array()

let selectedElement = null

let elementPositions = new Map()

function getElementID(){
    if(unusedElementIDs.length !== 0)
        return unusedElementIDs.pop()
    else{
        ++largestElementID
        return `el-${largestElementID - 1}`
    }
}

function configureElement(element){
    if(element.classList.contains('note')){
        addNoteListeners(element)
    }else if(element.classList.contains('notepad')){
        addNotepadListeners(element)
    }else if(element.classList.contains('whiteboard')){
        addWhiteboardListeners(element)
    }
}

function configureAllElements(elements){
    for(let element of elements){
        configureElement(element)
    }
}

function configurePath(path){
    addPathListeners(path)
}

function configureAllPaths(paths){
    for(let [key, value] of paths)
        configurePath(value)
}

function createNewElement(container, el, id, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpace = convertToWhiteboardSpace(centerX - rect.width / 2, centerY - rect.height / 2)

    el.id = id
    elementPositions.set(el.id, { x: boardSpace.x, y: boardSpace.y })

    updateElementPositionByID(el.id)

    el.style.width = '60px'
    el.style.visibility = 'visible'
}

function configurePWHeight(el){
    el.style.height = 'fit-content'
    el.style.width = 'fit-content'
    el.style.minHeight = '60px'
    el.style.minWidth = '60px'
}

function deleteComponentByID(container, elID){
    container.removeChild(document.getElementById(elID))
    unusedElementIDs.push(elID)

    disconnectConnectedPaths(elID)

    if (elementPositions.has(elID)) {
        elementPositions.delete(elID)
    }
}