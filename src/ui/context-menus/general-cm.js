const generalContextMenu = document.getElementById('general-context-menu')

document.getElementById('gcm-new-note').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNote(parentWhiteboard, '', contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('gcm-new-notepad').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNotepad(parentWhiteboard, contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('gcm-new-whiteboard').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewWhiteboard(parentWhiteboard, contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('gcm-new-connection').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createPath({ x: e.clientX, y: e.clientY }, contextMenuCenter.x, contextMenuCenter.y)

    concealContextMenu()
})

document.getElementById('gcm-paste').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await readWandererClipboard()
    let {isHTML, element} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(parentWhiteboard, clipboardContent, contextMenuCenter.x, contextMenuCenter.y)

    if(element.type === 'n'){
        return createNewNote(parentWhiteboard, element.content, contextMenuCenter.x, contextMenuCenter.y)
    }
})