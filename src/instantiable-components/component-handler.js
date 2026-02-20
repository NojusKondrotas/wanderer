let largestElementID = 0, unusedElementIDs = new Array()

let selectedElement = null

let elementPositions = new Map()

let allElementConnections = new Map();

function getElementID(){
    if(unusedElementIDs.length !== 0)
        return unusedElementIDs.pop()
    else{
        ++largestElementID
        return `el-${largestElementID - 1}`
    }
}

function instantiateResizingBorders(el){
    const borders = ['right', 'left'];
    borders.forEach(border => {
        const borderDiv = document.createElement('div');
        borderDiv.classList.add(`note-border`, `note-border-${border}`);
        el.appendChild(borderDiv);

        borderDiv.addEventListener('mouseenter', () => {
            if(!StatesHandler.isDragging) {
                document.body.style.cursor = 'ew-resize';
            }
        });

        borderDiv.addEventListener('mouseleave', () => {
            if(!StatesHandler.isDragging) {
                document.body.style.cursor = 'default';
            }
        });

        borderDiv.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            if(StatesHandler.isWritingElement) {
                toggleWritingMode(false, selectedElement.id);
            }
            this.isResizing = true;
            activeBorder = border;
            selectedElement = el;
            WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.resizeElement);
            document.body.style.cursor = 'ew-resize';
        });

        borderDiv.addEventListener('mouseup', function(e) {
            WhiteboardPositioningHandler.endDrag(e);
            document.body.style.cursor = 'default';
        });
    })
}

function reinstateAllBorders(elements){
    const keys = elements.keys();
    for(const k of keys){
        const el = document.getElementById(k);
        instantiateResizingBorders(el);
    }
}

function configureElement(element){
    if(element.classList.contains('note-container')){
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

function configurePath(path, startID, endID){
    addPathListeners(path)
    allElementConnections.get(startID)?.add(path.ID);
    allElementConnections.get(endID)?.add(path.ID);
}

function configureAllPaths(paths){
    const values = paths.values()
    for(let v of values)
        configurePath(v)
}

function addElementToPositioning(el, centerX = 0, centerY = 0){
    const rect = el.getBoundingClientRect()
    const boardSpace = convertToWhiteboardSpace(centerX - rect.width / 2, centerY - rect.height / 2)
    elementPositions.set(el.id, { x: boardSpace.x, y: boardSpace.y })
    updateElementPositionByID(el.id)
}

function addElementToPositioningLeftAlignment(el, offsetX = 0, offsetY = 0){
    const boardSpace = convertToWhiteboardSpace(offsetX, offsetY);

    elementPositions.set(el.id, { x: boardSpace.x, y: boardSpace.y });
    updateElementPositionByID(el.id);
}

function createNewElement(container, el, id, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.transition = 'none'
    el.style.visibility = 'hidden'

    el.id = id
    el.classList.add('component-text')

    addElementToPositioning(el, centerX, centerY)
    setTimeout(() => {
        el.style.transition = ''
    }, 20);
    el.style.visibility = 'visible'

    allElementConnections.set(id, new Set())
}

function createNewElementLeftAlignment(container, el, id, offsetX = 0, offsetY = 0){
    container.appendChild(el)
    el.style.transition = 'none'
    el.style.visibility = 'hidden'

    el.id = id
    el.classList.add('component-text')

    addElementToPositioningLeftAlignment(el, offsetX, offsetY)

    setTimeout(() => {
        el.style.transition = ''
    }, 20);
    el.style.visibility = 'visible'

    allElementConnections.set(id, new Set())
}

function deleteComponentByID(container, elID){
    container.removeChild(document.getElementById(elID))
    unusedElementIDs.push(elID)

    allElementConnections.delete(elID);

    disconnectConnectedPaths(elID)

    if (elementPositions.has(elID)) {
        elementPositions.delete(elID)
    }
}