const elementContextMenu = document.getElementById('element-context-menu');
const ecm = {
    blueprint : elementContextMenu,
    angleSize : 360 / elementContextMenu.children.length,
    radius : 90,
    angleOffset : 0,
    xOffset : 0,
    yOffset : -10
};

document.getElementById('ecm-copy').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-copy').addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);

    turnOffContextMenu();
});

document.getElementById('ecm-cut').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-cut').addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);
    
    deleteComponentByID(wbZoom, selectedElement.id, selectedElement.id);

    turnOffContextMenu();
});

document.getElementById('ecm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-delete').addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    if(selectedElement.classList.contains('note-container')) {
        deleteNoteByID(wbZoom, selectedElement.id);
    } else if(selectedElement.classList.contains('notepad')) {
        deleteNotepadByID(wbZoom, selectedElement.id);
    } else {
        deleteWhiteboardByID(wbZoom, selectedElement.id);
    }

    turnOffContextMenu();
});

document.getElementById('ecm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-connect').addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    forgetContextMenus();
    if (!selectedElement) return;

    createPath(wbZoom, { x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, selectedElement.id, null, true);
    console.log('path created');
});

document.getElementById('ecm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('ecm-disconnect').addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    disconnectConnectedPaths(selectedElement.id);

    turnOffContextMenu();
});