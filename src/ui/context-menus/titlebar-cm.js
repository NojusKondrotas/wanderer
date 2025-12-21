const titlebarContextMenu = document.getElementById('titlebar-context-menu');
const tcm = {
    blueprint : titlebarContextMenu,
    angleSize : 360 / titlebarContextMenu.children.length,
    radius : 85,
    angleOffset : 234,
    xOffset : -10,
    yOffset : -10
};

document.getElementById('tcm-fullscreen-window').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleFullScreen();
});

document.getElementById('tcm-maximize-window').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMaximized();
});

document.getElementById('tcm-minimize-window').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMinimized();
});

document.getElementById('tcm-close-window').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    closeWindow();
});

document.getElementById('tcm-global-config-menu').addEventListener('click', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    displayAllConfigs();
});