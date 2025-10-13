let isWindowClosing = false

window.addEventListener('DOMContentLoaded', async () => {
    handleKeybindGuideAppearance(true)
    initTitlebar()
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
    }
})

window.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
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

window.wandererAPI.openTitlebarContextMenu((mousePos, boundsOffset) => {
    openNewContextMenu(mousePos.x - boundsOffset.x, mousePos.y - boundsOffset.y, tcm)
})

window.wandererAPI.openTabMenu((mousePos, boundsOffset, windows) => {
    openTabsMenu(mousePos, boundsOffset, windows)
})