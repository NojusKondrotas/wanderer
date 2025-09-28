window.addEventListener('DOMContentLoaded', async () => {
    handleKeybindGuideAppearance(true)
    
    const stateObj = await window.wandererAPI.loadWhiteboardState()

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

function save(){
    saveAllQuillToolbars()
    window.wandererAPI.saveWhiteboardHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const allQuillToolbarsArr = Array.from(allQuillToolbars, ([elID, quill]) => [elID, quill])

    window.wandererAPI.saveWhiteboardState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestQlEditorID,
        unusedQlEditorIDs,
        elementPositions: elementPositionsArr,
        allPaths,
        allQuillToolbars: allQuillToolbarsArr,
    })
}

window.wandererAPI.onTerminateWindow(() => {
    save()
})

window.wandererAPI.onSaveComponent(() => {
    save()
})

window.wandererAPI.openTitlebarContextMenu((mousePos, boundsOffset) => {
    openNewContextMenu(mousePos.x - boundsOffset.x, mousePos.y - boundsOffset.y, titlebarContextMenu, 360 / 5, 85, 234, -10, -10)
})