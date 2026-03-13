import { placeAppearanceSingular, styleClosedCMOpt } from "../runtime/layout.js"
import { AppStates } from "../runtime/states-handler.js"
import { Vector2D } from "../runtime/vector-2d.js"
import { concealCMChild, forgetContextMenus, showCMChild } from "../ui/context-menus/handler-context-menu.js"
import { convertFromWhiteboardSpace } from "../ui/zoom-whiteboard.js"
import { allElementConnections } from "./component-handler.js"
import { allPaths, getPathMiddle, Path, selectedPath, setSelectedPath } from "./path.js"

let pathStartPoint: HTMLElement;
let pathMiddlePoint: HTMLElement;
let pathEndPoint: HTMLElement;

const timeoutACCM = 40;

export enum PathEditState {
    CONNECT,
    DISCONNECT,
    EMPTY
}

export function initPathConnectionCMOptions() {
    const StartPoint = document.getElementById('path-end-0');
    const MiddlePoint = document.getElementById('path-end-1');
    const EndPoint = document.getElementById('path-end-2');

    if(!StartPoint || !MiddlePoint || !EndPoint) {
        throw new Error("Some options of path connection context menu not found, cannot proceed");
    }

    pathStartPoint = StartPoint;
    pathMiddlePoint = MiddlePoint;
    pathEndPoint = EndPoint;

    pathStartPoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathStartPoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(AppStates.pathEditState === PathEditState.CONNECT) {
            connectPathStart(selectedPath)
        } else if(AppStates.pathEditState === PathEditState.DISCONNECT) {
            disconnectPathStart(selectedPath)
        }
        
        closePathConnectionContextMenu()
    })

    pathMiddlePoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathMiddlePoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(AppStates.pathEditState === PathEditState.DISCONNECT) {
            disconnectPathStart(selectedPath)
            disconnectPathEnd(selectedPath)
        }

        closePathConnectionContextMenu()
    })

    pathEndPoint.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    pathEndPoint.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(AppStates.pathEditState === PathEditState.CONNECT) {
            connectPathEnd(selectedPath)
        } else if(AppStates.pathEditState === PathEditState.DISCONNECT) {
            disconnectPathEnd(selectedPath)
        }

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
    allElementConnections.get(path.startNoteID)?.delete(path.ID);
    path.startNoteID = null;
}

function disconnectPathEnd(path){
    allElementConnections.get(path.endNoteID)?.delete(path.ID);
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

export function openPathConnectionContextMenu(editState: PathEditState = PathEditState.DISCONNECT){
    forgetContextMenus()

    const startPos = convertFromWhiteboardSpace(selectedPath!.startPosition.x, selectedPath!.startPosition.y)
    const pathMiddle = getPathMiddle(selectedPath!);
    const middlePos = convertFromWhiteboardSpace(pathMiddle.x, pathMiddle.y)
    const endPos = convertFromWhiteboardSpace(selectedPath!.endPosition.x, selectedPath!.endPosition.y)

    pathStartPoint.style.display = 'block'
    pathEndPoint.style.display = 'block'
    if(editState === PathEditState.DISCONNECT){
        pathMiddlePoint.style.display = 'block'
    }

    const offsetRange = new Vector2D(-25, 25);
    placeAppearanceSingular(pathStartPoint, startPos, styleClosedCMOpt, offsetRange);
    placeAppearanceSingular(pathEndPoint, endPos, styleClosedCMOpt, offsetRange);
    if(editState === PathEditState.DISCONNECT) {
        placeAppearanceSingular(pathMiddlePoint, middlePos, styleClosedCMOpt, offsetRange);
    }

    AppStates.isContextMenuOpen = true
    AppStates.pathEditState = editState
}

export function closePathConnectionContextMenu(){
    concealCMChild(pathStartPoint)
    concealCMChild(pathMiddlePoint)
    concealCMChild(pathEndPoint)

    AppStates.isContextMenuOpen = false
    AppStates.pathEditState = PathEditState.EMPTY
}