const elementContextMenu = document.getElementById('element-context-menu');
const npwcm = {
    blueprint : elementContextMenu,
    angleSize : 360 / elementContextMenu.children.length,
    radius : 90,
    angleOffset : 0,
    xOffset : 0,
    yOffset : -10
};

document.getElementById('npwcm-copy').addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);

    turnOffContextMenu();
});

document.getElementById('npwcm-cut').addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }
    
    copy(selectedElement);
    
    deleteComponentByID(parentWhiteboard, selectedElement.id);

    turnOffContextMenu();
});

document.getElementById('npwcm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    deleteNoteByID(parentWhiteboard, selectedElement.id);

    turnOffContextMenu();
});

document.getElementById('npwcm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    forgetContextMenus();
    if (!selectedElement) return;

    createPath({ x: contextMenuCenter.x, y: contextMenuCenter.y }, { x: e.clientX, y: e.clientY }, selectedElement.id, null, true);
});

document.getElementById('npwcm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    disconnectConnectedPaths(selectedElement.id);

    turnOffContextMenu();
});