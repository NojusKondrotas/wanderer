import { createNewNote } from "../../../instantiable-components/note.js";
import { createNewNotepad } from "../../../instantiable-components/notepad.js";
import { createPath } from "../../../instantiable-components/path.js";
import { createNewWhiteboard } from "../../../instantiable-components/whiteboard.js";
import { parseClipboardElement, readWandererClipboard } from "../../../runtime/clipboard.js";
import { wbZoom } from "../../parent-whiteboard-handler.js";
import { contextMenuCenter, forgetContextMenus, turnOffContextMenu } from "../handler-context-menu.js";

const generalContextMenu = document.getElementById('general-context-menu')!
export const gcm = {
    blueprint : generalContextMenu,
    angleSize : 360 / generalContextMenu.children.length,
    radius : 85,
    angleOffset : 162,
    xOffset : -10,
    yOffset : -10
};

document.getElementById('gcm-new-note')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('gcm-new-note')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    createNewNote(wbZoom, '', new Set(), new Set(), contextMenuCenter.x, contextMenuCenter.y);

    turnOffContextMenu();
});

document.getElementById('gcm-new-notepad')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('gcm-new-notepad')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    createNewNotepad(wbZoom, contextMenuCenter.x, contextMenuCenter.y);

    turnOffContextMenu();
});

document.getElementById('gcm-new-whiteboard')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('gcm-new-whiteboard')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    createNewWhiteboard(wbZoom, contextMenuCenter.x, contextMenuCenter.y);

    turnOffContextMenu();
});

document.getElementById('gcm-new-connection')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('gcm-new-connection')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    createPath(wbZoom, { x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, null, null, true);

    forgetContextMenus();
});

document.getElementById('gcm-paste')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('gcm-paste')!.addEventListener('mouseup', async (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    let clipboardContent = await readWandererClipboard();
    let {isHTML, element} = parseClipboardElement(clipboardContent);
    if(!isHTML) return createNewNote(wbZoom, clipboardContent, new Set(), new Set(), contextMenuCenter.x, contextMenuCenter.y);

    if(element.type === 'n'){
        return createNewNote(wbZoom, element.content, new Set(), new Set(), contextMenuCenter.x, contextMenuCenter.y);
    }
});