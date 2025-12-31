initTitlebar();

function closeWindow(){
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
});

(async () => {
    const center = await window.wandererAPI.getWindowCenter();
    displayAllConfigs(center.x, center.y);
})();