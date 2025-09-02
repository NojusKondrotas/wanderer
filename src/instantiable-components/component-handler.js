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

function configureElement(element){
    if(element.classList.contains('note')){
        element.contentEditable = 'false'
        element.style.userSelect = 'none'

        addNoteListeners(element)
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
    for(let path of paths)
        configurePath(path)
}

function createNewElement(container, el, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpaceX = centerX - rect.width / 2
    const boardSpaceY = centerY - rect.height / 2

    el.id = `${getElementID()}`
    elementPositions.set(el.id, { x: boardSpaceX, y: boardSpaceY })

    updateElementPositionByID(el.id)

    el.style.visibility = 'visible'
}

function removeElementByID(container, elID){
    container.removeChild(document.getElementById(elID))
    unusedElementIDs.push(elID)

    disconnectConnectedPaths(elID)

    if (elementPositions.has(elID)) {
        elementPositions.delete(elID)
    }
}