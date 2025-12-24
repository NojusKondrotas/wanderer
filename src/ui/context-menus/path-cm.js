const pathContextMenu = document.getElementById('path-context-menu');
const acm = {
    blueprint : pathContextMenu,
    angleSize : 360 / pathContextMenu.children.length,
    radius : 70,
    angleOffset : 90,
    xOffset : 0,
    yOffset : -10
};

document.getElementById('acm-connect').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-connect').addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-connect').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    openPathConnectionContextMenu(true);
});

document.getElementById('acm-disconnect').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-disconnect').addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-disconnect').addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('acm-disconnect');

    if(e.button === 2){
        return;
    }

    openPathConnectionContextMenu(false);
});

document.getElementById('acm-delete').addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-delete').addEventListener('mouseup', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-delete').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    deletePathByID(selectedPath.ID);

    turnOffContextMenu();
});