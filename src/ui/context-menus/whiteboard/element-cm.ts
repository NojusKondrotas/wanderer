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

export function initElementCMOptions() {
    const COPY = document.getElementById('ecm-copy');
    const CUT = document.getElementById('ecm-cut');
    const DELETE = document.getElementById('ecm-delete');
    const CONNECT = document.getElementById('ecm-connect');
    const DISCONNECT = document.getElementById('ecm-disconnect');

    if(!COPY || !CUT || !DELETE
        || !CONNECT || !DISCONNECT
    ) {
        throw new Error("Some options of element context menu not found, cannot proceed");
    }

    COPY.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    COPY.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(e.button === 2){
            return;
        }
        
        copy(selectedElement);

        turnOffContextMenu();
    });

    CUT.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    CUT.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(e.button === 2){
            return;
        }
        
        copy(selectedElement);
        
        deleteComponentByID(wbZoom, selectedElement!.id, selectedElement!.id);

        turnOffContextMenu();
    });

    DELETE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    DELETE.addEventListener('mouseup', (e) => {
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

    CONNECT.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    CONNECT.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(e.button === 2){
            return;
        }

        forgetContextMenus();
        if (!selectedElement) return;

        createPath(wbZoom, { x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, selectedElement.id, null, true);
        console.log('path created');
    });

    DISCONNECT.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    DISCONNECT.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(e.button === 2){
            return;
        }

        disconnectConnectedPaths(selectedElement!.id);

        turnOffContextMenu();
    });
}