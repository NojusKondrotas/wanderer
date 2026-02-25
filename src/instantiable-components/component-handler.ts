import { AppStates } from "../runtime/states-handler.js";
import { updateElementPositionByID, WhiteboardPositioningHandler } from "../ui/positioning/whiteboard-positioning.js";
import { convertToWhiteboardSpace } from "../ui/zoom-whiteboard.js";
import { deleteFromHierarchy } from "./hierarchy-handler.js";
import { addNoteListeners, setActiveBorder, toggleWritingMode } from "./note.js";
import { addNotepadListeners } from "./notepad.js";
import { disconnectConnectedPaths } from "./path-connection-handler.js";
import { addPathListeners, Path } from "./path.js";
import { addWhiteboardListeners } from "./whiteboard.js";

export let largestElementID = 0, unusedElementIDs = new Array()
export const setLargestElID = (id) => largestElementID = id;
export const setUnusedElIDs = (ids) => unusedElementIDs = ids;

export let selectedElement: HTMLElement | null = null;
export const setSelectedElement = (el: HTMLElement | null) => selectedElement = el;
export let elementPositions = new Map();
export const setElementPositions = (map) => elementPositions = map;
export let allElementConnections = new Map();
export const setAllElementConnections = (map) => allElementConnections = map;

export enum ComponentTypes {
    NOTE,
    NOTEPAD,
    WHITEBOARD,
    PATH,
};

export function getElementID(){
    if(unusedElementIDs.length !== 0)
        return unusedElementIDs.pop()
    else{
        ++largestElementID
        return `el-${largestElementID - 1}`
    }
}

export function instantiateResizingBorders(el){
    const borders = ['right', 'left'];
    borders.forEach(border => {
        const borderDiv = document.createElement('div');
        borderDiv.classList.add(`note-border`, `note-border-${border}`);
        el.appendChild(borderDiv);

        borderDiv.addEventListener('mouseenter', () => {
            if(!AppStates.isDragging) {
                document.body.style.cursor = 'ew-resize';
            }
        });

        borderDiv.addEventListener('mouseleave', () => {
            if(!AppStates.isDragging) {
                document.body.style.cursor = 'default';
            }
        });

        borderDiv.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            if(AppStates.isWritingElement) {
                toggleWritingMode(false, selectedElement!.id);
            }
            setActiveBorder(border);
            setSelectedElement(el);
            WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.resizeElement);
            document.body.style.cursor = 'ew-resize';
        });

        borderDiv.addEventListener('mouseup', function(e) {
            WhiteboardPositioningHandler.endDrag(e);
            document.body.style.cursor = 'default';
        });
    })
}

export function reinstateAllBorders(elements){
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

export function configureAllElements(elements){
    for(let element of elements){
        configureElement(element)
    }
}

export function configurePath(path: Path, options?: { startID?: string | null, endID?: string | null }){
    addPathListeners(path)
    allElementConnections.get(options?.startID)?.add(path.ID);
    allElementConnections.get(options?.endID)?.add(path.ID);
}

export function configureAllPaths(paths){
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

export function createNewElement(container, el, id, centerX = 0, centerY = 0){
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

export function createNewElementLeftAlignment(container, el, id, offsetX = 0, offsetY = 0){
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

export function deleteComponentByID(container, elID, idsPush){
    container.removeChild(document.getElementById(elID))
    for(let id of idsPush) unusedElementIDs.push(id);

    deleteFromHierarchy(elID);

    allElementConnections.delete(elID);

    disconnectConnectedPaths(elID)

    if (elementPositions.has(elID)) {
        elementPositions.delete(elID)
    }
}