import { deleteComponentByID, selectedElement } from "../../../instantiable-components/component-handler.js";
import { deleteNoteByID } from "../../../instantiable-components/note.js";
import { deleteNotepadByID } from "../../../instantiable-components/notepad.js";
import { disconnectConnectedPaths } from "../../../instantiable-components/path-connection-handler.js";
import { createPath } from "../../../instantiable-components/path.js";
import { deleteWhiteboardByID } from "../../../instantiable-components/whiteboard.js";
import { copy } from "../../../runtime/clipboard.js";
import { wbZoom } from "../../parent-whiteboard-handler.js";
import { contextMenuCenter, ContextMenuRegister, createContextMenu, createContextMenuCircular, forgetContextMenus, turnOffContextMenu } from "../handler-context-menu.js";

export const ecm: string = "ecm";

export function registerElementCM(identifier: string) {
    const elementCM = document.getElementById('element-context-menu');

    if(elementCM)
        return ContextMenuRegister.registerContextMenu(
            identifier,
            createContextMenuCircular(
                createContextMenu(
                    elementCM,
                    (elementCM.children) as HTMLCollectionOf<HTMLElement>,
                    0,
                    -10
                ),
                360 / elementCM.children.length,
                90,
                0
            )
        );
}

document.getElementById('ecm-copy')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-copy')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);

    turnOffContextMenu();
});

document.getElementById('ecm-cut')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-cut')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);
    
    deleteComponentByID(wbZoom, selectedElement!.id, selectedElement!.id);

    turnOffContextMenu();
});

document.getElementById('ecm-delete')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-delete')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    if(selectedElement!.classList.contains('note-container')) {
        deleteNoteByID(wbZoom, selectedElement!.id);
    } else if(selectedElement!.classList.contains('notepad')) {
        deleteNotepadByID(wbZoom, selectedElement!.id);
    } else {
        deleteWhiteboardByID(wbZoom, selectedElement!.id);
    }

    turnOffContextMenu();
});

document.getElementById('ecm-connect')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-connect')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    forgetContextMenus();
    if (!selectedElement) return;

    createPath(wbZoom, { x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, selectedElement.id, null, true);
    console.log('path created');
});

document.getElementById('ecm-disconnect')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-disconnect')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    disconnectConnectedPaths(selectedElement!.id);

    turnOffContextMenu();
});