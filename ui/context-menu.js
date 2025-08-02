const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-notepad-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

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

function turnOffContextMenu(){
    generalContextMenu.style.display = 'none'
    noteAndNotepadContextMenu.style.display = 'none'
    selectedElement = null
    isContextMenuOpen = false
}