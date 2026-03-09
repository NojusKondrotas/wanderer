import { createNewNote } from "../../../instantiable-components/note.js";
import { createNewNotepad } from "../../../instantiable-components/notepad.js";
import { createPath } from "../../../instantiable-components/path.js";
import { createNewWhiteboard } from "../../../instantiable-components/whiteboard.js";
import { parseClipboardElement, readWandererClipboard } from "../../../runtime/clipboard.js";
import { wbZoom } from "../../parent-whiteboard-handler.js";
import { contextMenuCenter, ContextMenuRegister, createContextMenu, createContextMenuCircular, forgetContextMenus, turnOffContextMenu } from "../handler-context-menu.js";

export const gcm: string = "gcm";

export function registerGeneralCM(identifier) {
    const generalCM = document.getElementById('general-context-menu');

    if(generalCM)
        return ContextMenuRegister.registerContextMenu(
            identifier,
            createContextMenuCircular(
                createContextMenu(
                    generalCM,
                    (generalCM.children) as HTMLCollectionOf<HTMLElement>,
                    -10,
                    -10
                ),
                360 / generalCM.children.length,
                85,
                162
            )
        );
}

export function initGeneralCMOptions() {
    const NEW_NOTE = document.getElementById('gcm-new-note');
    const NEW_NOTEPAD = document.getElementById('gcm-new-notepad');
    const NEW_WHITEBOARD = document.getElementById('gcm-new-whiteboard');
    const NEW_CONNECTION = document.getElementById('gcm-new-connection');
    const PASTE = document.getElementById('gcm-paste');

    if(!NEW_NOTE || !NEW_NOTEPAD || !NEW_WHITEBOARD
        || !NEW_CONNECTION || !PASTE
    ) {
        throw new Error("Some options of general context menu not found, cannot proceed");
    }

    NEW_NOTE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    NEW_NOTE.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        createNewNote(wbZoom, '', new Set(), new Set(), contextMenuCenter);

        turnOffContextMenu();
    });

    NEW_NOTEPAD.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    NEW_NOTEPAD.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        createNewNotepad(wbZoom, contextMenuCenter);

        turnOffContextMenu();
    });

    NEW_WHITEBOARD.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    NEW_WHITEBOARD.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        createNewWhiteboard(wbZoom, contextMenuCenter);

        turnOffContextMenu();
    });

    NEW_CONNECTION.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    NEW_CONNECTION.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        createPath(wbZoom, { x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, null, null, true);

        forgetContextMenus();
    });

    PASTE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    PASTE.addEventListener('mouseup', async (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        let clipboardContent = await readWandererClipboard();
        let {isHTML, element} = parseClipboardElement(clipboardContent);
        if(!isHTML) return createNewNote(wbZoom, clipboardContent, new Set(), new Set(), contextMenuCenter);

        if(element.type === 'n'){
            return createNewNote(wbZoom, element.content, new Set(), new Set(), contextMenuCenter);
        }
    });
}