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
        allPaths = stateObj.allPaths
        allQuillToolbars = new Map(stateObj.allQuillToolbars.map(e => [e.id, e.quill]))

        isTitlebarLocked = stateObj.isTitlebarLocked
        isFullscreen = stateObj.isFullscreen

        window.wandererAPI.setFullscreen(isFullscreen)

        configureAllElements(whiteboard.children)
        configureAllPaths(allPaths)
        reinstateAllQuillToolbars()
        reinstateAllNoteBorders(elementPositions)

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(elementPositions)
        console.log(allPaths)
        console.log(allQuillToolbars)
        console.log(isTitlebarLocked)
        console.log(isFullscreen)
    }
})

function save(){
    saveAllQuillToolbars()
    window.wandererAPI.saveHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const allQuillToolbarsArr = Array.from(allQuillToolbars, ([elID, quill]) => [elID, quill])

    window.wandererAPI.saveState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestQlEditorID,
        unusedQlEditorIDs,
        elementPositions: elementPositionsArr,
        allPaths,
        allQuillToolbars: allQuillToolbarsArr,
        isTitlebarLocked,
        isFullscreen,
    })
}

window.addEventListener('beforeunload', () => {
    save()
})

window.addEventListener('terminate-app', () => {
    save()
})

window.wandererAPI.openTitlebarContextMenu((mousePos, boundsOffset) => {
    openNewContextMenu(mousePos.x - boundsOffset.x, mousePos.y - boundsOffset.y, titlebarContextMenu, 360 / 5, 85, 234, -10, -10)
})