const optionsMenu = document.getElementById('global-configuration-menu')

let wasNewElementAdded = false

function configureNewChild(child){
    if(!child.classList.contains('note')) return
    child.contentEditable = 'false'
    child.style.userSelect = 'none'

    child.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(isWritingElement) return
        selectedElement = child

        generateCircularContextMenu(e.clientX, e.clientY, noteAndNotepadContextMenu, 360 / 5, 70, -18, 0, -10)
        contextMenuCenter = {x:e.clientX, y:e.clientY}

        generalContextMenu.style.display = 'none'
        noteAndNotepadContextMenu.style.display = 'block'
        isContextMenuOpen = true
    })

    child.addEventListener('mousedown', (e) => {
        if(e.button !== 2){
            e.stopPropagation()
            if(isWritingElement) return

            if(isContextMenuOpen){
                generalContextMenu.style.display = 'none'
                noteAndNotepadContextMenu.style.display = 'none'
                selectedElement = null
                isContextMenuOpen = false
                return;
            }
            
            child.contentEditable = 'false'
            isWritingElement = false

            tmp_elementOrigin = {x:e.clientX, y:e.clientY}
            tmp_elementOffset = elementOffsets.get(child)

            isDraggingElement = true
            selectedElement = child
        }
    })

    child.addEventListener('dblclick', (e) => {
        child.contentEditable = 'true'

        setTimeout(() => {
            child.focus()

            const pos = document.caretPositionFromPoint(e.clientX, e.clientY)
            range = document.createRange()
            range.setStart(pos.offsetNode, pos.offset)
            range.collapse(true)

            if (range) {
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
            }
        }, 0)

        isWritingElement = true
        isDraggingElement = false
    })
}

function createNewElement(container, el, centerX = 0, centerY = 0){
    container.appendChild(el)
    el.style.visibility = 'hidden'

    const rect = el.getBoundingClientRect()

    const boardSpaceX = centerX - boardOffset.x - rect.width / 2
    const boardSpaceY = centerY - boardOffset.y - rect.height / 2

    elementOffsets.set(el, { x: boardSpaceX, y: boardSpaceY })
    configureNewChild(el)

    updateElementPosition(el)

    el.style.visibility = 'visible'
}

function createNewNote(container, content = '', xOffset = 0, yOffset = 0){
    const newNote = document.createElement('div')
    newNote.classList.add('note')
    newNote.textContent = content

    createNewElement(container, newNote, xOffset, yOffset)
}

Array.from(whiteboard.children).forEach(child => {configureNewChild(child); elementOffsets.set(child, { x: 0, y: 0 })})

document.addEventListener('mousemove', (e) => {
    // Only update scales if the context menu is open
    if (!isContextMenuOpen) return;

    Array.from(optionCtrls).forEach(ctrl => {
        const rect = ctrl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

        if (distance > 100) {
            ctrl.style.transform = 'translate(-50%, -50%) scale(1)';
            return;
        }

        let factor
        if(distance < 20) factor = 1.2
        else{
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            let t = (distance - 20) / (100 - 20);
            t = Math.min(Math.max(t, 0), 1);

            factor = 1 + 0.2 * (1 - easeOutCubic(t));
        }
        ctrl.style.transform = `translate(-50%, -50%) scale(${factor})`;
    });
});


whiteboard.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()

    generateCircularContextMenu(e.clientX, e.clientY, generalContextMenu, 360 / 5, 85, 234, -10, -10)
    contextMenuCenter = {x:e.clientX, y:e.clientY}

    noteAndNotepadContextMenu.style.display = 'none'
    generalContextMenu.style.display = 'block'
    isContextMenuOpen = true
})

document.getElementById('new-note').addEventListener('click', (e) => createNewNote(whiteboard, '', contextMenuCenter.x, contextMenuCenter.y))

document.getElementById('copy').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    text = IDClipboardContent(selectedElement.outerHTML)

    navigator.clipboard.writeText(text)

    turnOffContextMenu()
})

document.getElementById('cut').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    text = IDClipboardContent(selectedElement.outerHTML)

    navigator.clipboard.writeText(text)
    selectedElement.remove()

    turnOffContextMenu()
})

document.getElementById('paste').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await navigator.clipboard.readText();

    let {isHTML, parsedString} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(whiteboard, parsedString, contextMenuCenter.x, contextMenuCenter.y)

    Array.from(parsedString.children).forEach(child => {
        createNewElement(whiteboard, child, contextMenuCenter.x, contextMenuCenter.y)
    })
})

document.getElementById('connect-interelement').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    
})