import { AppStates } from "../runtime/states-handler.js"
import { forgetContextMenus } from "../ui/context-menus/handler-context-menu.js"
import { convertFromWhiteboardSpace } from "../ui/zoom-whiteboard.js"
import { allElementConnections } from "./component-handler.js"
import { allPaths, getPathMiddle, selectedPath, setSelectedPath } from "./path.js"

let pathStartPoint: HTMLElement;
let pathMiddlePoint: HTMLElement;
let pathEndPoint: HTMLElement;
let pathStartPointInner: HTMLElement;
let pathMiddlePointInner: HTMLElement;
let pathEndPointInner: HTMLElement;

const timeoutACCM = 40;

export function initPathConnectionCMOptions() {
    const StartPoint = document.getElementById('path-end-0');
    const MiddlePoint = document.getElementById('path-end-1');
    const EndPoint = document.getElementById('path-end-2');
    const StartPointInner = document.getElementById('path-end-inner-0');
    const MiddlePointInner = document.getElementById('path-end-inner-1');
    const EndPointInner = document.getElementById('path-end-inner-2');

    if(!StartPoint || !MiddlePoint || !EndPoint
        || !StartPointInner || !MiddlePointInner || !EndPointInner
    ) {
        throw new Error("Some options of path connection context menu not found, cannot proceed");
    }

    pathStartPoint = StartPoint;
    pathMiddlePoint = MiddlePoint;
    pathEndPoint = EndPoint;
    pathStartPointInner = StartPointInner;
    pathMiddlePointInner = MiddlePointInner;
    pathEndPointInner = EndPointInner;

    pathStartPoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathStartPoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(AppStates.isConnecting) connectPathStart(selectedPath)
        else disconnectPathStart(selectedPath)
        closePathConnectionContextMenu()
    })

    pathMiddlePoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathMiddlePoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        disconnectPathStart(selectedPath)
        disconnectPathEnd(selectedPath)
        closePathConnectionContextMenu()
    })

    pathEndPoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathEndPoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(AppStates.isConnecting) connectPathEnd(selectedPath)
        else disconnectPathEnd(selectedPath)
        closePathConnectionContextMenu()
    })
}

function connectPathStart(path){
    AppStates.isDrawingPath = true
    setSelectedPath(path)
    AppStates.isDrawingPathEnd = false
}

function connectPathEnd(path){
    AppStates.isDrawingPath = true
    setSelectedPath(path)
    AppStates.isDrawingPathEnd = true
}

function disconnectPathStart(path){
    allElementConnections.get(path.startNoteID).delete(path.ID);
    path.startNoteID = null;
}

function disconnectPathEnd(path){
    allElementConnections.get(path.endNoteID).delete(path.ID);
    path.endNoteID = null;
}

export function disconnectConnectedPaths(elID){
    const paths = allElementConnections.get(elID);
    if(paths) {
        for(const pathID of paths){
            const path = allPaths.get(pathID);
            if(path.startNoteID === elID){
                path.startNoteID = null
            }else if(path.endNoteID === elID){
                path.endNoteID = null
            }
        }
        allElementConnections.set(elID, new Set());
    }
}

export function openPathConnectionContextMenu(isConnecting = false){
    forgetContextMenus()

    const startPos = convertFromWhiteboardSpace(selectedPath!.startPosition.x, selectedPath!.startPosition.y)
    const pathMiddle = getPathMiddle(selectedPath!);
    console.log(pathMiddle)
    const middlePos = convertFromWhiteboardSpace(pathMiddle.x, pathMiddle.y)
    const endPos = convertFromWhiteboardSpace(selectedPath!.endPosition.x, selectedPath!.endPosition.y)
    pathStartPoint.style.left = `${startPos.x}px`
    pathStartPoint.style.top = `${startPos.y}px`
    pathEndPoint.style.left = `${endPos.x}px`
    pathEndPoint.style.top = `${endPos.y}px`
    pathStartPoint.style.display = 'flex'
    pathEndPoint.style.display = 'flex'
    if(!isConnecting){
        pathMiddlePoint.style.left = `${middlePos.x}px`
        pathMiddlePoint.style.top = `${middlePos.y}px`
        pathMiddlePoint.style.display = 'flex'
    }

    requestAnimationFrame(() => {
        pathStartPoint.style.transform = 'translate(-50%, -50%) scale(1)';
        pathEndPoint.style.transform = 'translate(-50%, -50%) scale(1)';
        pathStartPoint.style.opacity = '1'
        pathEndPoint.style.opacity = '1'
        if(!isConnecting){
            pathMiddlePoint.style.transform = 'translate(-50%, -50%) scale(1)';
            pathMiddlePoint.style.opacity = '1'
        }
    });

    AppStates.isContextMenuOpen = true
    AppStates.isConnecting = isConnecting
}

export function closePathConnectionContextMenu(){
    pathStartPoint.style.transform = 'translate(-50%, -50%) scale(0)'
    pathMiddlePoint.style.transform = 'translate(-50%, -50%) scale(0)';
    pathEndPoint.style.transform = 'translate(-50%, -50%) scale(0)'
    pathStartPoint.style.opacity = '0'
    pathMiddlePoint.style.opacity = '0'
    pathEndPoint.style.opacity = '0'
    setTimeout(() => {
        pathStartPoint.style.display = 'none'
        pathMiddlePoint.style.display = 'none'
        pathEndPoint.style.display = 'none'
    }, timeoutACCM);

    AppStates.isContextMenuOpen = false
    AppStates.isConnecting = false
}