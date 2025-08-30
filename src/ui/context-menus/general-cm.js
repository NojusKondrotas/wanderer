const generalContextMenu = document.getElementById('general-context-menu')

document.getElementById('gcm-new-note').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNote(whiteboard, '', contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('gcm-paste').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await readElementWandererClipboard()
    let {isHTML, parsedString} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(whiteboard, parsedString, contextMenuCenter.x, contextMenuCenter.y)

    Array.from(parsedString.children).forEach(child => {
        createNewElement(whiteboard, child, contextMenuCenter.x, contextMenuCenter.y)
    })
})