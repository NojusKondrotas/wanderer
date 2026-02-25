import { allElementConnections, elementPositions, selectedElement, setSelectedElement } from "../../instantiable-components/component-handler.js"
import { activeBorder, toggleWritingMode } from "../../instantiable-components/note.js"
import { closePathConnectionContextMenu } from "../../instantiable-components/path-connection-handler.js"
import { allPaths, deletePathByID, selectedPath, terminatePathDrawing, updatePathPosition } from "../../instantiable-components/path.js"
import { Vector2D } from "../../runtime/numerics.js"
import { AppStates } from "../../runtime/states-handler.js"
import { turnOffContextMenu } from "../context-menus/handler-context-menu.js"
import { handleKeybindGuideAppearance } from "../keybind-guide.js"
import { isCombo, KeybindIndices, keybinds } from "../keybinds.js"
import { wbMovement } from "../parent-whiteboard-handler.js"
import { titlebar, toggleTitlebar, toggleTitlebarVisualHover } from "../titlebars/titlebar.js"
import { convertToWhiteboardSpace, zoomFactor } from "../zoom-whiteboard.js"
import { MouseDragHandler } from "./mouse-drag-calc.js"
import { WindowPositioningHandler } from "./window-positioning.js"

export let wbOffset = new Vector2D(0, 0)
export const setWBOffset = (offset: Vector2D) => wbOffset = offset

export class WhiteboardPositioningHandler{
    static isDraggingBoard = false
    static isDraggingElement = false
    static isResizingElement = false

    static elementResizeStart

    static dragStates = Object.freeze({
        moveBoard: 'move-board',
        moveElement: 'move-element',
        moveWindow: 'move-window',
        resizeElement: 'resize-element',
        resizeWindow: 'resize-window'
    });

    static resize(ev){
        const dxResizeScreen = ev.clientX - this.elementResizeStart.dx;
        const dxResizeBoard = dxResizeScreen / zoomFactor;

        if (activeBorder === 'right') {
            selectedElement!.style.width = Math.max(this.elementResizeStart.width + dxResizeBoard, 22) + 'px';
        } else if (activeBorder === 'left') {
            const newWidth = Math.max(this.elementResizeStart.width - dxResizeBoard, 22);
            if(newWidth === 22 && dxResizeBoard >= 0) return;

            selectedElement!.style.width = newWidth + 'px';
            selectedElement!.style.left = (this.elementResizeStart.offsetLeft + dxResizeBoard) + 'px';
        }
    }

    static element_MouseDown(ev, el){
        if(ev.button !== 2){
            ev.stopPropagation()
            if(AppStates.isWritingElement) return toggleWritingMode(false, selectedElement!.id)
            if(AppStates.isContextMenuOpen){
                turnOffContextMenu()
                return
            }

            WhiteboardPositioningHandler.startDrag(ev, WhiteboardPositioningHandler.dragStates.moveElement)
            
            if(el.classList.contains('.note')) toggleWritingMode(false, el.id)

            setSelectedElement(el)
        }
    }

    static element_MouseUp(ev, el){
        if(AppStates.isWritingElement) return

        let draggedEnough = MouseDragHandler.checkIfDraggedEnough();
        if(draggedEnough) {
            AppStates.willNotWrite = true;
        } else {
            AppStates.willNotWrite = false;
        }

        if(el.classList.contains('note-container')) {
            document.body.style.cursor = 'text';
        }

        if(AppStates.isDrawingPath){
            if(!draggedEnough){
                this.isDraggingElement = false;
                if(el.id === selectedPath!.startNoteID){
                    deletePathByID(selectedPath!.ID)
                    return this.endDrag(ev)
                }
                terminatePathDrawing(ev, el.id)
                return this.endDrag(ev)
            }
        }
        else this.endDrag(ev)
    }

    static update(ev){
        MouseDragHandler.updateMouseDrag(ev)
        
        if (this.isResizingElement){
            this.resize(ev)
        }else if(this.isDraggingBoard){
            wbOffset.x -= MouseDragHandler.dragDiff.x * zoomFactor;
            wbOffset.y -= MouseDragHandler.dragDiff.y * zoomFactor;

            wbMovement.style.transform = `translate(${wbOffset.x}px, ${wbOffset.y}px)`;
        }else if(WindowPositioningHandler.isDraggingWindow){
            WindowPositioningHandler.moveWindow()
        }else if (WindowPositioningHandler.isResizingWindow) {
            WindowPositioningHandler.resizeWindow()
        }else if(this.isDraggingElement){
            updateElementPositionByID(selectedElement!.id)
            const paths = allElementConnections.get(selectedElement!.id);
            if(paths) {
                for(const pathID of paths) {
                    const path = allPaths.get(pathID);
                    let hasUpdated = false
                    if(path.startNoteID === selectedElement!.id){
                        path.startPosition.x -= MouseDragHandler.dragDiff.x
                        path.startPosition.y -= MouseDragHandler.dragDiff.y
                        path.originStartPos.x -= MouseDragHandler.dragDiff.x
                        path.originStartPos.y -= MouseDragHandler.dragDiff.y
                        hasUpdated = true
                    }else if(path.endNoteID === selectedElement!.id){
                        path.endPosition.x -= MouseDragHandler.dragDiff.x
                        path.endPosition.y -= MouseDragHandler.dragDiff.y
                        path.originEndPos.x -= MouseDragHandler.dragDiff.x
                        path.originEndPos.y -= MouseDragHandler.dragDiff.y
                        hasUpdated = true
                    }

                    if(hasUpdated){
                        const mousePos = convertToWhiteboardSpace(ev.clientX, ev.clientY)
                        let startPoint, endPoint
                        if(AppStates.isDrawingPathEnd){
                            startPoint = {
                                x: path.startPosition.x,
                                y: path.startPosition.y
                            }
                            if(AppStates.isDrawingPath && path === selectedPath){
                                endPoint = mousePos
                            }else{
                                endPoint = {
                                    x: path.endPosition.x,
                                    y: path.endPosition.y
                                }
                            }
                        }else{
                            endPoint = {
                                x: path.endPosition.x,
                                y: path.endPosition.y
                            }
                            if(AppStates.isDrawingPath && path === selectedPath){
                                startPoint = mousePos
                            }else{
                                startPoint = {
                                    x: path.startPosition.x,
                                    y: path.startPosition.y
                                }
                            }
                        }
                        updatePathPosition(path, startPoint, endPoint)
                    }
                }
            }
        }
        
        if(AppStates.isDrawingPath){
            const mousePos = convertToWhiteboardSpace(ev.clientX, ev.clientY)
            toggleTitlebar(false)
            if(AppStates.isDrawingPathEnd)
                updatePathPosition(selectedPath!, selectedPath!.startPosition, mousePos)
            else
                updatePathPosition(selectedPath!, mousePos, selectedPath!.endPosition)
        }
    }

    static startResize(ev) {
        const rect = selectedElement!.getBoundingClientRect();

        this.elementResizeStart = {
            dx: ev.clientX,
            width: parseFloat(selectedElement!.style.width) || rect.width,
            offsetLeft: selectedElement!.offsetLeft
        };
    }

    static startDrag(ev, dragState){
        if(ev.button === 2) return;

        if(AppStates.isContextMenuOpen){
            turnOffContextMenu()
            closePathConnectionContextMenu()
            return
        }
        if(AppStates.isWritingElement){
            toggleWritingMode(false, selectedElement!.id)
            return
        }

        document.querySelectorAll('.note-editor').forEach((noteEditor) => {
            document.getElementById(noteEditor.id)!.contentEditable = 'false'
        })

        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev);

        this.isDraggingBoard = dragState === this.dragStates.moveBoard;
        this.isDraggingElement = dragState === this.dragStates.moveElement;
        this.isResizingElement = dragState === this.dragStates.resizeElement;
        WindowPositioningHandler.isDraggingWindow = dragState === this.dragStates.moveWindow;
        WindowPositioningHandler.isResizingWindow = dragState === this.dragStates.resizeWindow;

        if(this.isResizingElement) this.startResize(ev);

        toggleTitlebar(false)
        handleKeybindGuideAppearance(false)

        AppStates.isDragging = true;
        document.body.style.cursor = 'default';
    }

    static endDrag(ev){
        if(ev.button === 2) return;

        if(AppStates.isContextMenuOpen){
            turnOffContextMenu()
            closePathConnectionContextMenu()
        }
        if(this.isResizingElement){
            this.isResizingElement = false
            document.body.style.cursor = 'default'
        }
        if(AppStates.isWritingElement){
            toggleWritingMode(false, selectedElement!.id)
            return
        }
        if(AppStates.isDrawingPath){
            if(!MouseDragHandler.checkIfDraggedEnough()){
                terminatePathDrawing(ev, null)
            }
        }

        toggleTitlebar(true)
        const el = document.elementFromPoint(ev.clientX, ev.clientY)
        if (el === titlebar) {
            toggleTitlebarVisualHover(false)
        }
        
        this.isDraggingBoard = false
        this.isDraggingElement = false
        MouseDragHandler.resetMouseDrag(ev)
        WindowPositioningHandler.resetWindowDrag(ev);

        setSelectedElement(null)
        handleKeybindGuideAppearance(true)

        AppStates.isDragging = false;
    }
}

export function getAbsolutePosition(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top - marginTop,
        left: rect.left - marginLeft
    };
}

export function setElementLeftPos(elID, x) {
    const elPos = elementPositions.get(elID);

    const offsetX = x;
    const offsetY = elPos.y;
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID)!.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

export function setElementTopPos(elID, y) {
    const elPos = elementPositions.get(elID);

    const offsetX = elPos.x;
    const offsetY = y;
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID)!.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

export function updateElementPositionByIDByOffset(elID, x, y) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - x
    const offsetY = elPos.y - y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID)!.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

export function updateElementPositionByID(elID) {
    const elPos = elementPositions.get(elID)

    const offsetX = elPos.x - MouseDragHandler.dragDiff.x
    const offsetY = elPos.y - MouseDragHandler.dragDiff.y
    elementPositions.set(elID, { x: offsetX, y: offsetY})

    document.getElementById(elID)!.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}

export function updateComponentPositionsByOffset(x, y){
    const keys = elementPositions.keys();
    for (const k of keys){
        updateElementPositionByIDByOffset(k, x, y)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= x
        path.startPosition.y -= y
        path.originStartPos.x -= x
        path.originStartPos.y -= y

        path.endPosition.x -= x
        path.endPosition.y -= y
        path.originEndPos.x -= x
        path.originEndPos.y -= y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function updateComponentPositions(){
    const keys = elementPositions.keys();
    for (const k of keys){
        updateElementPositionByID(k)
    }
    
    allPaths.forEach(path => {
        path.startPosition.x -= MouseDragHandler.dragDiff.x
        path.startPosition.y -= MouseDragHandler.dragDiff.y
        path.originStartPos.x -= MouseDragHandler.dragDiff.x
        path.originStartPos.y -= MouseDragHandler.dragDiff.y

        path.endPosition.x -= MouseDragHandler.dragDiff.x
        path.endPosition.y -= MouseDragHandler.dragDiff.y
        path.originEndPos.x -= MouseDragHandler.dragDiff.x
        path.originEndPos.y -= MouseDragHandler.dragDiff.y

        updatePathPosition(path, path.startPosition, path.endPosition)
    })
}

function genMouseDown_WhiteboardMoveHandler(e){
    if(isCombo(keybinds[KeybindIndices.windowDragKeybind])) WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.moveWindow)
    else if(isCombo(keybinds[KeybindIndices.windowResizeKeybind])) WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.resizeWindow)
    else WhiteboardPositioningHandler.startDrag(e, WhiteboardPositioningHandler.dragStates.moveBoard)
}

function genMouseMove_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.update(e)
}

function genMouseUp_WhiteboardMoveHandler(e){
    WhiteboardPositioningHandler.endDrag(e)
}