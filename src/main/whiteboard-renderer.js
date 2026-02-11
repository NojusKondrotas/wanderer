let isWindowClosing = false

let scrollLastX = window.scrollX, scrollLastY = window.scrollY;
let scrollIsChanging = false;

window.addEventListener('DOMContentLoaded', async () => {
    StatesHandler.isComponentWhiteboard = true

    windowComponentID = await window.wandererAPI.getWindowComponentID()
    windowComponentIDEl = document.getElementById('window-component-id')
    windowComponentIDEl.textContent = windowComponentID
    
    const stateObj = await window.wandererAPI.loadWhiteboardState()

    if (stateObj && Object.keys(stateObj).length > 0){
        largestElementID = stateObj.largestElementID
        unusedElementIDs = stateObj.unusedElementIDs
        largestPathID = stateObj.largestPathID
        unusedPathIDs = stateObj.unusedPathIDs
        largestNoteContainerID = stateObj.largestNoteContainerID
        unusedNoteContainerIDs = stateObj.unusedNoteContainerIDs

        elementPositions = new Map(stateObj.elementPositions)
        elementHierarchy = new Map(stateObj.elementHierarchy)
        const values = elementHierarchy.values();
        for(const v of values){
            v[0] = new Set(v[0]);
            v[1] = new Set(v[1]);
        }
        allPaths = new Map(stateObj.allPaths)
        allNotesContents = new Map(stateObj.allNotesContents)

        StatesHandler.isTitlebarLocked = stateObj.isTitlebarLocked
        zoomFactor = stateObj.zoomFactor
        boardOffset = stateObj.boardOffset
        wbOffset = stateObj.wbOffset

        configureAllElements(wbZoom.children)
        configureAllPaths(allPaths)
        reinstateAllNotesContents()
        reinstateAllBorders(elementPositions)

        document.body.style.cursor = 'default'

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(largestNoteContainerID)
        console.log(unusedNoteContainerIDs)
        console.log(elementPositions)
        console.log(elementHierarchy)
        console.log(allPaths)
        console.log(allNotesContents)
        console.log(StatesHandler.isTitlebarLocked)
        console.log(zoomFactor)
        console.log(boardOffset)
        console.log(wbOffset)
    }

    handleKeybindGuideAppearance(true)
    initTitlebar()
})

window.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
})

window.addEventListener('contextmenu', (e) => {
    if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id);
    if(StatesHandler.isDrawingPath){
        terminatePathDrawing(e, null);
    }

    openNewContextMenu(e.clientX, e.clientY, gcm)
})

window.addEventListener('mousedown', (e) => {
    closeTabsMenu()
    genMouseDown_WhiteboardMoveHandler(e)
})

window.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})

window.addEventListener("scroll", () => {
    const dx = window.scrollX - scrollLastX;
    const dy = window.scrollY - scrollLastY;
    scrollLastX = window.scrollX;
    scrollLastY = window.scrollY;
    window.scrollTo(0, 0);
    if(!scrollIsChanging){
        updateComponentPositionsByOffset(dx, dy);
        scrollIsChanging = true;
    } else scrollIsChanging = false;
});

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIn = e.deltaY < 0;
    zoomWhiteboard({ x: e.clientX, y: e.clientY }, zoomIn);
}, { passive: false });

async function save(){
    closeTabsMenu();
    saveAllNotesContents()
    await window.wandererAPI.saveWhiteboardHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const elementHierarchyArr = Array.from(elementHierarchy, ([elID, [parents, children]]) => [elID, [Array.from(parents), Array.from(children)]])
    const allPathsArr = Array.from(allPaths, ([id, path]) => [id, path])
    const allNotesContentsArr = Array.from(allNotesContents, ([elID, note]) => [elID, note])

    await window.wandererAPI.saveWhiteboardState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestNoteContainerID,
        unusedNoteContainerIDs,
        elementPositions: elementPositionsArr,
        elementHierarchy: elementHierarchyArr,
        allPaths: allPathsArr,
        allNotesContents: allNotesContentsArr,
        isTitlebarLocked: StatesHandler.isTitlebarLocked,
        zoomFactor,
        boardOffset,
        wbOffset
    })
}

function closeWindow(){
    isWindowClosing = true
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onTerminateWindow(() => {
    isWindowClosing = true
})

window.wandererAPI.onSaveComponent(async () => {
    await save();
    window.wandererAPI.saveComponentDone();
})

window.addEventListener("beforeunload", () => {
    if(!isWindowClosing){
        logMessage('berfore unload triggered');
        save();
    }
})

window.wandererAPI.openTitlebarContextMenu((mousePos) => {
    openNewContextMenu(mousePos.x, mousePos.y, tcm)
})

window.wandererAPI.openTabMenu(async (mousePos, windows, previews) => {
    openTabsMenu(mousePos, windows, previews);
});

window.wandererAPI.closeTabMenu(async () => {
    closeTabsMenu();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.wandererAPI.closeTabMenuDone();
        });
    });
});

window.wandererAPI.zoomInWindow((mousePos) => zoomWhiteboard(mousePos, true))
window.wandererAPI.zoomOutWindow((mousePos) => zoomWhiteboard(mousePos, false))