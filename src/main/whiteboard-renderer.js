let isWindowClosing = false

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

        elementPositions = new Map(stateObj.elementPositions)
        elementHierarchy = new Map(stateObj.elementHierarchy)
        for(let [key,value] of elementHierarchy){
            value[0] = new Set(value[0]);
            value[1] = new Set(value[1]);
        }
        allPaths = new Map(stateObj.allPaths)
        allNotes = new Map(stateObj.allNotes)

        StatesHandler.isTitlebarLocked = stateObj.isTitlebarLocked

        configureAllElements(parentWhiteboard.children)
        configureAllPaths(allPaths)
        reinstateAllNotes()
        reinstateAllNoteBorders(elementPositions)

        document.body.style.cursor = 'default'

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(elementPositions)
        console.log(elementHierarchy)
        console.log(allPaths)
        console.log(allNotes)
        console.log(StatesHandler.isTitlebarLocked)
    }

    handleKeybindGuideAppearance(true)
    initTitlebar()
})

window.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
})

window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if(StatesHandler.isWritingElement) toggleWritingMode(false, selectedElement.id)

    openNewContextMenu(e.clientX, e.clientY, gcm)
})

window.addEventListener('mousedown', (e) => {
    genMouseDown_WhiteboardMoveHandler(e)
})

window.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})

function save(){
    saveAllNotes()
    window.wandererAPI.saveWhiteboardHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const elementHierarchyArr = Array.from(elementHierarchy, ([elID, [parents, children]]) => [elID, [Array.from(parents), Array.from(children)]])
    const allPathsArr = Array.from(allPaths, ([id, path]) => [id, path])
    const allNotesArr = Array.from(allNotes, ([elID, note]) => [elID, note])

    window.wandererAPI.saveWhiteboardState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        elementPositions: elementPositionsArr,
        elementHierarchy: elementHierarchyArr,
        allPaths: allPathsArr,
        allNotes: allNotesArr,
        isTitlebarLocked: StatesHandler.isTitlebarLocked
    })
}

function closeWindow(){
    isWindowClosing = true
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onTerminateWindow(() => {
    isWindowClosing = true
})

window.wandererAPI.onSaveComponent(() => {
    save()
})

window.addEventListener("beforeunload", () => {
    if(!isWindowClosing){
        save()
    }
})

window.wandererAPI.openTitlebarContextMenu((mousePos) => {
    openNewContextMenu(mousePos.x, mousePos.y, tcm)
})

window.wandererAPI.openTabMenu((mousePos, windows) => {
    openTabsMenu(mousePos, windows)
})

window.wandererAPI.zoomInWindow((mousePos) => zoomWhiteboard(mousePos, true))
window.wandererAPI.zoomOutWindow((mousePos) => zoomWhiteboard(mousePos, false))