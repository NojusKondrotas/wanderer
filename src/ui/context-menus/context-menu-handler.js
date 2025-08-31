const allContextMenus = document.getElementsByClassName('context-menu')

let isContextMenuOpen = false
let activeContextMenu = null, contextMenuCenter = {x:0, y:0}

function generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    contextMenuBlueprint.style.left = `${centerX}px`
    contextMenuBlueprint.style.top = `${centerY}px`
    activeContextMenu = contextMenuBlueprint

    Array.from(contextMenuBlueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = radius * Math.cos(angleRad) + xOffset
        let y = radius * Math.sin(angleRad) + yOffset

        const offsetX = generateRandom(-50, 50)
        const offsetY = generateRandom(-50, 50)

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
    for(let cm of allContextMenus)
        cm.style.display = 'none'

    isContextMenuOpen = false
    activeContextMenu = null
}

function turnOffContextMenu(){
    concealContextMenu()
    isContextMenuOpen = false
    selectedElement = null
    selectedPath = null
}

function openNewContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0){
    function revealContextMenu(contextMenuBlueprint){
        contextMenuBlueprint.style.display = 'block'
        isContextMenuOpen = true
    }
    
    concealContextMenu()
    revealContextMenu(contextMenuBlueprint)
    contextMenuCenter = { x: centerX, y: centerY }
    generateCircularContextMenu(centerX, centerY, contextMenuBlueprint, angleSize, radius, angleOffset, xOffset, yOffset)
}

function genMouseMove_ContextMenuHandler(e){
    if (!isContextMenuOpen) return

    Array.from(activeContextMenu.children).forEach(ctrl => {
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
            function easeOutCubic(t){
                return 1 - Math.pow(1 - t, 3)
            }

            let t = (distance - 20) / (100 - 20)
            t = Math.min(Math.max(t, 0), 1)

            factor = 1 + 0.2 * (1 - easeOutCubic(t))
        }
        ctrl.style.transform = `translate(-50%, -50%) scale(${factor})`
    })
}