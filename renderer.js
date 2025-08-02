const titlebar = document.querySelector('.titlebar')
const titlebarVisual = document.getElementById('titlebar-visual')
const whiteboard = document.getElementById('whiteboard')
const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-notepad-context-menu')
const optionsMenu = document.getElementById('global-configuration-menu')
const optionCtrls = document.getElementsByClassName('option-control')

const titlebarFullscreenCtrl = document.getElementById('fullscreen-window')
const titlebarMaximizeCtrl = document.getElementById('maximize-window')
const titlebarCloseCtrl = document.getElementById('close-window')
const titlebarLockCtrl = document.getElementById('lock-titlebar')

let isDraggingBoard = false
let boardOffset = {x: 0, y:0}, boardOrigin = {x: 0, y: 0}
const elementOffsets = new WeakMap()

let selectedElement = null
let isDraggingElement = false, isWritingElement = false
let tmp_elementOffset = {x: 0, y:0}, tmp_elementOrigin = {x: 0, y:0}

let isTitlebarLocked = false

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

let wasNewElementAdded = false
let currClipboardID = 0

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

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize;
        const angleRad = angleDeg * Math.PI / 180;

        let x = radius * Math.cos(angleRad) + xOffset;
        let y = radius * Math.sin(angleRad) + yOffset;

        option.style.left = `${x}px`;
        option.style.top = `${y}px`;
    });
}

function updateElementPosition(el) {
    const elOffset = elementOffsets.get(el)
    if (!elOffset) elementOffsets.set(el, { x: 0, y: 0 })

    let x = boardOffset.x + elOffset.x
    let y = boardOffset.y + elOffset.y

    if (el instanceof SVGElement) {
        el.setAttribute('transform', `translate(${x}, ${y})`)
    } else if (el instanceof HTMLElement) {
        el.style.transform = `translate(${x}px, ${y}px)`
    }
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

function turnOffContextMenu(){
    generalContextMenu.style.display = 'none'
    noteAndNotepadContextMenu.style.display = 'none'
    selectedElement = null
    isContextMenuOpen = false
}

function generateRandom(minRange = 0x1000, maxRange = 0xffffffff){
    return Math.floor(Math.random() * maxRange + minRange)
}

function IDClipboardContent(content, minRange = 0x1000, maxRange = 0xffffffff){
    currClipboardID = generateRandom(minRange, maxRange).toString(16)
    
    let text = `[${currClipboardID}]` + content
    
    return text
}

function parseClipboardElement(elementIDHTML){
    let HTMLContent, isHTML = false
    
    if(elementIDHTML[0] === '['){
        if(elementIDHTML.substring(1, elementIDHTML.indexOf(']')) === currClipboardID)
            HTMLContent = elementIDHTML.substring(elementIDHTML.indexOf(']') + 1)
        else return {isHTML: isHTML, parsedString: elementIDHTML}
    }
    else return {isHTML: isHTML, parsedString: elementIDHTML}
    isHTML = true
    
    const template = document.createElement('template');
    template.innerHTML = HTMLContent.trim();

    const newElement = template.content;

    return {isHTML: isHTML, parsedString: newElement}
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

whiteboard.addEventListener('mousedown', (e) => {
    if(e.button !== 2){
        if(isContextMenuOpen){
            turnOffContextMenu()
            return;
        }

        isWritingElement = false
        Array.from(whiteboard.children).forEach((child) => {
            child.contentEditable = 'false'
        })

        isDraggingBoard = true
        boardOrigin = {x:e.clientX, y:e.clientY}
    }
})

whiteboard.addEventListener('mousemove', (e) => {
    if(isDraggingBoard){
        const dx = e.clientX - boardOrigin.x
        const dy = e.clientY - boardOrigin.y

        boardOffset.x += dx
        boardOffset.y += dy
        boardOrigin = { x: e.clientX, y: e.clientY }
        Array.from(whiteboard.children).forEach(child => {
            updateElementPosition(child)
        })
    }
    else if(isDraggingElement){
        const dx = e.clientX - tmp_elementOrigin.x
        const dy = e.clientY - tmp_elementOrigin.y

        elementOffsets.set(selectedElement, {x: tmp_elementOffset.x + dx, y: tmp_elementOffset.y + dy})

        updateElementPosition(selectedElement)
    }
})

document.addEventListener('mouseup', () => {
    if(selectedElement){
        selectedElement = null
        isDraggingElement = false
    }

    isDraggingBoard = false
})

titlebarFullscreenCtrl.addEventListener('click', () => {
    window.wandererAPI.isFullscreen().then((isFull) => {
        if(isFull) window.wandererAPI.setFullscreen(false)
        else window.wandererAPI.setFullscreen(true)
    })

    titlebarFullscreenCtrl.blur()
})

titlebarMaximizeCtrl.addEventListener('click', () => {
    window.wandererAPI.isMaximized().then((isMax) => {
        if(isMax) window.wandererAPI.setMaximized(false)
        else window.wandererAPI.setMaximized(true)
    })

    titlebarMaximizeCtrl.blur()
})

titlebarCloseCtrl.addEventListener('click', () => window.wandererAPI.closeWindow())

titlebarLockCtrl.addEventListener('click', () => {
    if(isTitlebarLocked){
        titlebarVisual.style.removeProperty('transform');

        isTitlebarLocked = false
    }
    else{
        titlebarVisual.style.setProperty('transform', 'translateY(0px)')

        isTitlebarLocked = true
    }

    titlebarLockCtrl.blur()
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