import { AppStates } from "../runtime/states-handler.js"
import { openNewContextMenu } from "../ui/context-menus/handler-context-menu.js"
import { ecm } from "../ui/context-menus/whiteboard/element-cm.js"
import { WhiteboardPositioningHandler } from "../ui/positioning/whiteboard-positioning.js"
import { createNewElement, deleteComponentByID, instantiateResizingBorders, selectedElement, setSelectedElement } from "./component-handler.js"
import { toggleWritingMode } from "./note.js"

export function addNotepadListeners(notepad){
    notepad.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id)
        
        setSelectedElement(notepad)

        openNewContextMenu(e.clientX, e.clientY, ecm)
    })

    notepad.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseDown(e, notepad)
    })

    notepad.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, notepad)
    })

    notepad.addEventListener('dblclick', (e) => {
        if(AppStates.isWritingElement) return

        window.wandererAPI.openNotepad(notepad.id)
    })
}

export async function createNewNotepad(container, xOffset = 0, yOffset = 0){
    const id = await window.wandererAPI.addNotepad() as string
    
    const newNotepad = document.createElement('div')
    newNotepad.classList.add('notepad')
    newNotepad.textContent = id

    createNewElement(container, newNotepad, id, xOffset, yOffset)
    addNotepadListeners(newNotepad)
    instantiateResizingBorders(newNotepad);
}

export function deleteNotepadByID(container, notepadID){
    deleteComponentByID(container, notepadID, []);
}