const allContextMenus = document.getElementsByClassName('cm-logic')
const borderColorCM = { opaque: "rgb(97, 97, 97)", transparent: "rgba(97, 97, 97, 0)" }
const colorCM = { opaque: "rgb(0, 0, 0)", transparent: "rgba(0, 0, 0, 0)" }
const timeoutCM = 170

let activeContextMenu = null, contextMenuCenter = {x:0, y:0}

function generateCircularContextMenu(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0 }){
    blueprint.style.left = `${centerX}px`
    blueprint.style.top = `${centerY}px`

    Array.from(blueprint.children).forEach((option, i) => {
        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = radius * Math.cos(angleRad) + xOffset
        let y = radius * Math.sin(angleRad) + yOffset

        const offsetX = generateRandom(-50, 50)
        const offsetY = generateRandom(-50, 50)

        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`
    })

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
        Array.from(blueprint.children).forEach((option, i) => {
            const angleDeg = angleOffset + i * angleSize
            const angleRad = angleDeg * Math.PI / 180
            const x = radius * Math.cos(angleRad) + xOffset
            const y = radius * Math.sin(angleRad) + yOffset

            option.style.left = `${x}px`
            option.style.top = `${y}px`
            option.style.borderColor = borderColorCM.opaque
            option.style.color = colorCM.opaque
            option.style.backdropFilter = 'blur(2px) opacity(1)';
        })
        })
    })
}

function moveContextMenu(centerX, centerY, blueprint){
    blueprint.style.left = `${centerX}px`
    blueprint.style.top = `${centerY}px`
}

function concealContextMenuChildren(cm){
    Array.from(cm.children).forEach((option) => {
        let truePos = getAbsolutePosition(option);
        const offsetX = generateRandom(-50, 50);
        const offsetY = generateRandom(-50, 50);
        option.style.left = `${truePos.left + offsetX}px`;
        option.style.top = `${truePos.top + offsetY}px`;
        option.style.borderColor = borderColorCM.transparent;
        option.style.color = colorCM.transparent;
        option.style.backdropFilter = 'blur(2px) opacity(0)';
    });
}

function concealContextMenu(){
    for(let cm of allContextMenus){
        if(cm !== activeContextMenu){
            concealContextMenuChildren(cm)
            setTimeout(() => cm.style.display = 'none', timeoutCM)
        }
    }
}

function forgetContextMenuSelection(){
    selectedElement = null
    selectedPath = null
}

function forgetContextMenus(){
    activeContextMenu = null
    concealContextMenu()
    StatesHandler.isContextMenuOpen = false
}

function turnOffContextMenu(){
    forgetContextMenus()
    forgetContextMenuSelection()
}

function openNewContextMenu(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0 }){
    if(activeContextMenu === blueprint){
        contextMenuCenter = { x: centerX, y: centerY };
        return moveContextMenu(centerX, centerY, blueprint);
    }
    activeContextMenu = blueprint
    closeTabsMenu()
    concealContextMenu()
    blueprint.style.display = 'block'
    StatesHandler.isContextMenuOpen = true
    contextMenuCenter = { x: centerX, y: centerY }
    generateCircularContextMenu(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset, yOffset })
}

function genMouseMove_ContextMenuHandler(e){
    if (!StatesHandler.isContextMenuOpen || !activeContextMenu) return

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