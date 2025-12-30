initTitlebar();

function closeWindow(){
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
})

displayAllConfigs();