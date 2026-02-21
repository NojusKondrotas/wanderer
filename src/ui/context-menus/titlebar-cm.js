const titlebarContextMenu = document.getElementById('titlebar-context-menu');
const tcm = {
    blueprint : titlebarContextMenu,
    angleSize : 360 / titlebarContextMenu.children.length,
    radius : 85,
    angleOffset : 234,
    xOffset : -10,
    yOffset : -10
};

const tcmOpts = [
    document.getElementById('tcm-fullscreen-window'),
    document.getElementById('tcm-maximize-window'),
    document.getElementById('tcm-minimize-window'),
    document.getElementById('tcm-close-window'),
    document.getElementById('tcm-global-config-menu')
];

tcmOpts[0].addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[0].addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleFullScreen();
});

tcmOpts[1].addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[1].addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMaximized();
});

tcmOpts[2].addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[2].addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMinimized();
});

tcmOpts[3].addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[3].addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    closeWindow();
});

tcmOpts[4].addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[4].addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    displayConfigs();
});