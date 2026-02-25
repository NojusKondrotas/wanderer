import { allElementConnections, configurePath, deleteComponentByID, getElementID, selectedElement, setSelectedElement } from "./component-handler.js"
import { Vector2D } from "../runtime/numerics.js"
import { convertToWhiteboardSpace } from "../ui/zoom-whiteboard.js"
import { AppStates } from "../runtime/states-handler.js"
import { wbZoom } from "../ui/parent-whiteboard-handler.js"
import { toggleWritingMode } from "./note.js"
import { openNewContextMenu } from "../ui/context-menus/handler-context-menu.js"
import { acm } from "../ui/context-menus/path-cm.js"

export let largestPathID = 0
export const setLargestPathID = (id) => largestPathID = id;

export let allPaths = new Map(), unusedPathIDs = new Array()
export const setAllPaths = (map) => allPaths = map;
export const setUnusedPathIDs = (map) => unusedPathIDs = map;

export let selectedPath: Path | null = null

export function setSelectedPath(path: Path | null) {
    selectedPath = path;
}

const pathVisualShape = 'line', pathVisualWidth = 2

export class Path {
    constructor(public ID: string,
        public pathVisualID: string,
        public hitPathID: string,
        public startNoteID: string | null = null,
        public endNoteID: string | null = null,
        public originStartPos: Vector2D,
        public originEndPos: Vector2D,
        public startPosition: Vector2D,
        public endPosition: Vector2D,
        public isHierarchicalStart: boolean = false,
        public isHierarchicalEnd: boolean = false,
        public shape: string) { }
}

function getPathID(){
    if(unusedPathIDs.length !== 0)
        return unusedPathIDs.pop()
    else{
        ++largestPathID
        return `path-${largestPathID - 1}`
    }
}

export function createPath(container: HTMLElement, startPos: Vector2D, endPos: Vector2D,
    startElement_id: string | null = null, endElement_id: string | null = null, isDrawing = false, isHierarchicalStart = false, isHierarchicalEnd = false){
    const div = document.createElement('div')
    div.classList.add('path-container')

    const boardSpaceStartPos = convertToWhiteboardSpace(startPos.x, startPos.y)
    const boardSpaceEndPos = convertToWhiteboardSpace(endPos.x, endPos.y)

    const drawnPath = document.createElementNS("http://www.w3.org/2000/svg", 'svg')

    const pathVisual = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    pathVisual.classList.add('path')
    pathVisual.setAttribute("stroke", "#626464ff")
    pathVisual.setAttribute("stroke-width", `${pathVisualWidth}`)
    pathVisual.setAttribute("fill", "none")
    pathVisual.style.pointerEvents = 'none'
    pathVisual.setAttribute("id", `${getPathID()}`)

    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    hitPath.setAttribute("stroke", "transparent")
    hitPath.setAttribute("stroke-width", `${pathVisualWidth * 8}`)
    hitPath.setAttribute("fill", "none")
    hitPath.style.pointerEvents = 'stroke'
    hitPath.setAttribute("id", `${getPathID()}`)

    drawnPath.appendChild(hitPath)
    drawnPath.appendChild(pathVisual)
    div.appendChild(drawnPath)
    container.appendChild(div)
    div.id = `${getElementID()}`
    div.style.visibility = 'visible'

    const path = new Path(
        div.id,
        pathVisual.id,
        hitPath.id,
        startElement_id,
        endElement_id,
        { ...boardSpaceStartPos },
        { ...boardSpaceEndPos },
        { ...boardSpaceStartPos },
        { ...boardSpaceEndPos },
        isHierarchicalStart,
        isHierarchicalEnd,
        pathVisualShape
    )
    configurePath(path, { startID: startElement_id, endID: endElement_id} )
    allPaths.set(div.id, path)
    selectedPath = path
    AppStates.isDrawingPath = isDrawing
    AppStates.isDrawingPathEnd = isDrawing
    updatePathPosition(path, path.startPosition, path.endPosition)
    return path
}

export function addPathListeners(path){
    document.getElementById(path.hitPathID)!.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        if(AppStates.isDrawingPath){
            return;
        }
        e.stopPropagation()
        console.log('right clicked on hitPath')
        if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id)

        selectedPath = path
        openNewContextMenu(e.clientX, e.clientY, acm)
    })
}

export function getPathMiddle(path: Path) {
    const pathEl = document.getElementById(path.pathVisualID) as SVGPathElement | null;
    const len = pathEl!.getTotalLength();
    return pathEl!.getPointAtLength(len / 2);
}

function addPathArrows(x1: number, y1: number, x2: number, y2: number): string {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const size = 8
    const a1 = angle + Math.PI / 6
    const a2 = angle - Math.PI / 6

    const ax1 = x2 - size * Math.cos(a1)
    const ay1 = y2 - size * Math.sin(a1)
    const ax2 = x2 - size * Math.cos(a2)
    const ay2 = y2 - size * Math.sin(a2)

    const arrow = ` M ${ax1} ${ay1} L ${x2} ${y2} L ${ax2} ${ay2}`

    return arrow
}

function updatePathData(x1: number, y1: number, x2: number, y2: number, isStartPoint = false, isEndPoint = false, shape = 'line') {
    let pathData: string = "", startPrevX: number, startPrevY: number, endPrevX: number, endPrevY: number
    switch(shape){
        case 'line':
            pathData = `M ${x1} ${y1} L ${x2} ${y2}`
            startPrevX = x2, startPrevY = y2
            endPrevX = x1, endPrevY = y1
            break
        case 'curve':
            const dx = (x2 - x1) / 2
            pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
            startPrevX = x1 + dx, startPrevY = y1
            endPrevX = x2 - dx, endPrevY = y2
            break
        case 'right-angle':
            pathData = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
            startPrevX = x1, startPrevY = y2
            endPrevX = x2, endPrevY = y2
            break
        case 'zigzag':
            const midX = (x1 + x2) / 2
            pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
            startPrevX = midX, startPrevY = y1
            endPrevX = midX, endPrevY = y2
            break
        default:
            return pathData;
    }

    let arrowStart: string | null = null, arrowEnd: string | null = null
    if(isStartPoint)
        arrowStart = addPathArrows(x1, y1, startPrevX, startPrevY)
    if(isEndPoint)
        arrowEnd = addPathArrows(x2, y2, endPrevX, endPrevY)

    if(!arrowStart){
        if(!arrowEnd)
            return pathData
        return pathData + arrowEnd
        }
    if(!arrowEnd)
        return pathData + arrowStart
    return pathData + arrowStart + arrowEnd
}

export function updatePathPosition(path: Path, startPosition: Vector2D, endPosition: Vector2D){
    const updatedPath = updatePathData(startPosition.x, startPosition.y, endPosition.x, endPosition.y, path.isHierarchicalStart, path.isHierarchicalEnd, path.shape)
    document.getElementById(path.pathVisualID)!.setAttribute('d', updatedPath)
    document.getElementById(path.hitPathID)!.setAttribute('d', updatedPath)
}

export function terminatePathDrawing(ev: MouseEvent, elID: string | null){
    if(!selectedPath) {
        return;
    }
    if(AppStates.isDrawingPathEnd){
        selectedPath.endNoteID = elID;
        allElementConnections.get(elID)?.add(selectedPath.ID);
        selectedPath.endPosition = convertToWhiteboardSpace(ev.clientX, ev.clientY);
        selectedPath.originEndPos = convertToWhiteboardSpace(ev.clientX, ev.clientY);
    }else{
        selectedPath.startNoteID = elID;
        allElementConnections.get(elID)?.add(selectedPath.ID);
        selectedPath.startPosition = convertToWhiteboardSpace(ev.clientX, ev.clientY);
        selectedPath.originStartPos = convertToWhiteboardSpace(ev.clientX, ev.clientY);
    }

    AppStates.isDrawingPath = false
    selectedPath = null
}

export function deletePathByID(pathToRemoveID: string){
    if(allPaths.has(pathToRemoveID)){
        const pathToRemove = allPaths.get(pathToRemoveID)
        allPaths.delete(pathToRemoveID)
        allElementConnections.get(pathToRemove.startNoteID)?.delete(pathToRemove.ID)
        allElementConnections.get(pathToRemove.endNoteID)?.delete(pathToRemove.ID)

        unusedPathIDs.push(pathToRemove.pathVisualID)
        unusedPathIDs.push(pathToRemove.hitPathID)

        const pathVisual = document.getElementById(pathToRemove.pathVisualID)!
        const hitPath = document.getElementById(pathToRemove.hitPathID)!
        pathVisual.remove()
        hitPath.remove()
        deleteComponentByID(wbZoom, pathToRemoveID, [pathToRemoveID]);
    }
}