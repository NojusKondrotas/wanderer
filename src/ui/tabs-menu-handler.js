let openTabs = new Map();
let timeoutTab = 20;

function toggleChildrenFilter(container, cssFunction){
    Array.from(container.children).forEach(el => {
        if(!el.classList.contains('open-window'))
            el.style.filter = cssFunction
    })
}

function openTabsMenu(mousePos, windows, previews){
    turnOffContextMenu()
    toggleChildrenFilter(parentWhiteboard, 'blur(3px)')
    generateMultiCircularLayout(mousePos.x, mousePos.y, windows.length, 162, 250, 0, 0, -10, windows, previews)
    windows.forEach(w => {
        // console.log(w, windows.length)
    })

    StatesHandler.isTabsMenuOpen = true;
}
