const generalContextMenu = document.getElementById('general-context-menu')
const noteAndNotepadContextMenu = document.getElementById('note-and-notepad-context-menu')

const optionCtrls = document.getElementsByClassName('option-control')

let selectedElement = null

let isContextMenuOpen = false
let contextMenuCenter = {x:0, y:0}

let elementConnections = new WeakMap()
let isDrawingConnection = false
let drawnLine = null

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

document.addEventListener('mousemove', (e) => {
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
})

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
    e.stopPropagation();

    if (!selectedElement) return;

    isDrawingConnection = true;

    let connections = elementConnections.get(selectedElement);
    if (!connections) {
        elementConnections.set(selectedElement, []);
        connections = elementConnections.get(selectedElement);
    }

    const div = document.createElement('div');
    div.classList.add('svg-container');

    drawnLine = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');

    const startRect = selectedElement.getBoundingClientRect();
    const whiteboardRect = whiteboard.getBoundingClientRect();
    const initialBoardOffset = { x: boardOffset.x, y: boardOffset.y };

    const x1 = (startRect.left + startRect.width / 2);
    const y1 = (startRect.top + startRect.height / 2);

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x1);
    line.setAttribute('y2', y1);
    line.setAttribute("stroke", "red");
    line.setAttribute("stroke-width", "2");

    drawnLine.appendChild(line);
    div.appendChild(drawnLine);
    connections.push(div);
    createNewElement(whiteboard, div);

    let dragStart = null;
    let mouseDown = false;

    function mouseMoveHandler(ev) {
        if (!dragStart) dragStart = { x: ev.clientX, y: ev.clientY };

        const dx = boardOffset.x - initialBoardOffset.x;
        const dy = boardOffset.y - initialBoardOffset.y;

        const localX = ev.clientX - dx;
        const localY = ev.clientY - dy;

        line.setAttribute('x2', localX);
        line.setAttribute('y2', localY);
    }

    function mouseDownHandler(ev) {
        mouseDown = true;
        dragStart = { x: ev.clientX, y: ev.clientY };
    }

    function mouseUpHandler(ev) {
        const movedX = Math.abs(ev.clientX - dragStart.x);
        const movedY = Math.abs(ev.clientY - dragStart.y);
        const draggedEnough = movedX > 5 || movedY > 5;

        const dx = boardOffset.x - initialBoardOffset.x;
        const dy = boardOffset.y - initialBoardOffset.y;

        const localX = ev.clientX - dx;
        const localY = ev.clientY - dy;

        line.setAttribute('x2', localX);
        line.setAttribute('y2', localY);

        isDrawingConnection = false;

        if(!draggedEnough)
        {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mousedown', mouseDownHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }
    }

    // Activate drawing
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});
