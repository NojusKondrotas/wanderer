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
        largestQlEditorID = stateObj.largestQlEditorID
        unusedQlEditorIDs = stateObj.unusedQlEditorIDs

        elementPositions = new Map(stateObj.elementPositions)
        allPaths = new Map(stateObj.allPaths)
        allQuillToolbars = new Map(stateObj.allQuillToolbars)

        StatesHandler.isTitlebarLocked = stateObj.isTitlebarLocked

        configureAllElements(parentWhiteboard.children)
        configureAllPaths(allPaths)
        reinstateAllQuillToolbars()
        reinstateAllNoteBorders(elementPositions)

        document.body.style.cursor = 'default'

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(elementPositions)
        console.log(allPaths)
        console.log(allQuillToolbars)
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
    if(StatesHandler.isWritingElement) toggleQuillWritingMode(false, selectedElement.id)
    turnOffContextMenu()

    console.log('contextmenu window' + e.clientX + ' | ' + e.clientY)

    openNewContextMenu(e.clientX, e.clientY, gcm)
})

window.addEventListener('mousedown', (e) => {
    console.log('mousedown window')
    genMouseDown_WhiteboardMoveHandler(e)
})

window.addEventListener('mouseup', (e) => {
    console.log('mouseup window')
    genMouseUp_WhiteboardMoveHandler(e)
})

function save(){
    saveAllQuillToolbars()
    window.wandererAPI.saveWhiteboardHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const allPathsArr = Array.from(allPaths, ([id, path]) => [id, path])
    const allQuillToolbarsArr = Array.from(allQuillToolbars, ([elID, quill]) => [elID, quill])

    window.wandererAPI.saveWhiteboardState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestQlEditorID,
        unusedQlEditorIDs,
        elementPositions: elementPositionsArr,
        allPaths: allPathsArr,
        allQuillToolbars: allQuillToolbarsArr,
        isTitlebarLocked: StatesHandler.isTitlebarLocked
    })
}

function closeWindow(){
    isWindowClosing = true
    save()
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onTerminateWindow(() => {
    save()
})

window.wandererAPI.onSaveComponent(() => {
    save()
})

window.addEventListener("beforeunload", () => {
    if(!isWindowClosing) closeWindow()
})

window.wandererAPI.openTitlebarContextMenu((mousePos) => {
    openNewContextMenu(mousePos.x, mousePos.y, tcm)
})

window.wandererAPI.openTabMenu((mousePos, windows) => {
    openTabsMenu(mousePos, windows)
})

window.wandererAPI.zoomInWindow((mousePos) => zoomWhiteboard(mousePos, true))
window.wandererAPI.zoomOutWindow((mousePos) => zoomWhiteboard(mousePos, false))