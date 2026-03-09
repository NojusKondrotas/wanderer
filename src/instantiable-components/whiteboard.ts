import { AppStates } from "../runtime/states-handler.js"
import { Vector2D } from "../runtime/vector-2d.js"
import { openNewContextMenu } from "../ui/context-menus/handler-context-menu.js"
import { ecm } from "../ui/context-menus/whiteboard/element-cm.js"
import { WhiteboardPositioningHandler } from "../ui/positioning/whiteboard-positioning.js"
import { createNewElement, deleteComponentByID, instantiateResizingBorders, selectedElement, setSelectedElement } from "./component-handler.js"
import { toggleWritingMode } from "./note.js"

export function addWhiteboardListeners(whiteboard){
    whiteboard.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id)
        
        setSelectedElement(whiteboard)

        openNewContextMenu(e.clientX, e.clientY, ecm)
    })

    whiteboard.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseDown(e, whiteboard)
    })

    whiteboard.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, whiteboard)
    })

    whiteboard.addEventListener('dblclick', (e) => {
        if(AppStates.isWritingElement) return

        window.wandererAPI.openWhiteboard(whiteboard.id)
    })
}

export async function createNewWhiteboard(container, offset: Vector2D = new Vector2D(0, 0)){
    const id = await window.wandererAPI.addWhiteboard() as string

    const newWhiteboard = document.createElement('div')
    newWhiteboard.classList.add('whiteboard', 'component')
    newWhiteboard.textContent = id

    createNewElement(container, newWhiteboard, id, offset)
    addWhiteboardListeners(newWhiteboard);
    instantiateResizingBorders(newWhiteboard);
}

export function deleteWhiteboardByID(container, whiteboardID){
    deleteComponentByID(container, whiteboardID, []);
}