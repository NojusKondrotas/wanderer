window.addEventListener('DOMContentLoaded', async () => {
    handleKeybindGuideAppearance(true)
    
    const stateObj = await window.wandererAPI.loadState()

    if (stateObj && Object.keys(stateObj).length > 0){
        largestElementID = stateObj.largestElementID
        unusedElementIDs = stateObj.unusedElementIDs
        largestPathID = stateObj.largestPathID
        unusedPathIDs = stateObj.unusedPathIDs
        largestQlEditorID = stateObj.largestQlEditorID
        unusedQlEditorIDs = stateObj.unusedQlEditorIDs

        elementPositions = new Map(stateObj.elementPositions.map(e => [e.id, {x: e.x, y: e.y}]))
        allQlEditors = stateObj.allQlEditors
        allPaths = stateObj.allPaths

        isTitlebarLocked = stateObj.isTitlebarLocked
        isFullscreen = stateObj.isFullscreen
        isQuillToolbarDefined = stateObj.isQuillToolbarDefined
        quillToolbar = stateObj.quillToolbar

        window.wandererAPI.setFullscreen(isFullscreen)

        configureAllElements(whiteboard.children)
        configureAllPaths(allPaths)

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(elementPositions)
        console.log(allQlEditors)
        console.log(allPaths)
        console.log(isTitlebarLocked)
        console.log(isFullscreen)
    }
})

window.addEventListener('beforeunload', () => {
    window.wandererAPI.saveHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])

    window.wandererAPI.saveState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestQlEditorID,
        unusedQlEditorIDs,
        elementPositions: elementPositionsArr,
        allQlEditors,
        allPaths,
        isTitlebarLocked,
        isFullscreen,
    })
})

window.wandererAPI.openTitlebarContextMenu((mousePos, boundsOffset) => {
    openNewContextMenu(mousePos.x - boundsOffset.x, mousePos.y - boundsOffset.y, titlebarContextMenu, 360 / 5, 85, 234, -10, -10)
})