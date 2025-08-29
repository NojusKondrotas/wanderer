let totalElements = 0

const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-pad-context-menu')
const pathContextMenu = document.getElementById('path-context-menu')
const titlebarContextMenu = document.getElementById('titlebar-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let selectedElement = null

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = radius * Math.cos(angleRad) + xOffset
        let y = radius * Math.sin(angleRad) + yOffset

        const offsetX = (Math.random() - 0.5) * 100 // -50..+50 px
        const offsetY = (Math.random() - 0.5) * 100

        option.style.transition = "none"
        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`

        option.offsetHeight

        option.style.transition = "transform 240ms ease, left 240ms ease, top 240ms ease"
        option.style.left = `${x}px`
        option.style.top = `${y}px`
    })
}

function concealContextMenu(){
    generalContextMenu.style.display = 'none'
    noteAndNotepadContextMenu.style.display = 'none'
    pathContextMenu.style.display = 'none'
    titlebarContextMenu.style.display = 'none'

    isContextMenuOpen = false
}

function turnOffContextMenu(){
    concealContextMenu()
    isContextMenuOpen = false
    selectedElement = null
    selectedPath = null
}

function revealContextMenu(contextMenuBlueprint){
    contextMenuBlueprint.style.display = 'block'
    isContextMenuOpen = true
}

function openNewContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    concealContextMenu()
    revealContextMenu(contextMenuBlueprint)
    contextMenuCenter = {x:centerX, y:centerY}
    generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset, yOffset)
}

function docMouseMove_ContextMenuHandler(e){
    if (!isContextMenuOpen) return

    Array.from(optionCtrls).forEach(ctrl => {
        const rect = ctrl.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))

        if (distance > 100) {
            ctrl.style.transform = 'translate(-50%, -50%) scale(1)'
            return
        }

        let factor
        if(distance < 20) factor = 1.2
        else{
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3)
            }

            let t = (distance - 20) / (100 - 20)
            t = Math.min(Math.max(t, 0), 1)

            factor = 1 + 0.2 * (1 - easeOutCubic(t))
        }
        ctrl.style.transform = `translate(-50%, -50%) scale(${factor})`
    })
}

document.getElementById('new-note').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    createNewNote(whiteboard, '', contextMenuCenter.x, contextMenuCenter.y)

    turnOffContextMenu()
})

document.getElementById('copy-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)

    turnOffContextMenu()
})

document.getElementById('cut-note-and-pad').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    
    elementIDHTML = IDClipboardContent(selectedElement.outerHTML)
    elementContent = selectedElement.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)
    
    removeElement(whiteboard, selectedElement)

    turnOffContextMenu()
})

document.getElementById('paste-note').addEventListener('mousedown', async (e) => {
    e.stopPropagation()

    let clipboardContent = await readElementWandererClipboard()
    let {isHTML, parsedString} = parseClipboardElement(clipboardContent)
    if(!isHTML) return createNewNote(whiteboard, parsedString, contextMenuCenter.x, contextMenuCenter.y)

    Array.from(parsedString.children).forEach(child => {
        createNewElement(whiteboard, child, contextMenuCenter.x, contextMenuCenter.y)
    })
})

document.getElementById('delete-path').addEventListener('mousedown', (e) => {
    e.stopPropagation()

    deletePath(selectedPath)

    turnOffContextMenu()
})

document.getElementById('connect-element').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    concealContextMenu()
    if (!selectedElement) return

    path = createPath()
    PositioningHandler.isDrawingPath = true
    selectedPath = path

    suppressNextMouseUp = true
})