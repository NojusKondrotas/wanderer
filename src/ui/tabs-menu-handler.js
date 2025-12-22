let openTabs = new Map();
let timeoutTab = 230, areTabsClosed = true;

function getTabsMenuCircleCaps(amount){
    let circleCap = 6
    const res = new Array()

    while(true){
        if(amount - circleCap < 0)
            res.push(amount)
        else res.push(circleCap)

        amount -= circleCap
        if(amount <= 0) break

        circleCap += 5
    }

    return res
}

async function generateSingleTabsMenuCircle(centerX, centerY, amount, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0, windows, winIdx){
    for(let i = 0; i < amount; ++i){
        const option = document.createElement('button')
        option.classList.add('option-control-style')
        option.classList.add('open-window')

        const preview = document.createElement('img')
        const idDiv = document.createElement('div')
        preview.alt = windows[winIdx].componentID
        idDiv.textContent = windows[winIdx].componentID

        const dataUrl = await window.wandererAPI.getWindowPreview(windows[winIdx].symbolicWindowID)
        preview.src = dataUrl

        option.appendChild(preview)
        option.appendChild(idDiv)

        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = centerX + radius * Math.cos(angleRad) + xOffset
        let y = centerY + radius * Math.sin(angleRad) + yOffset

        createNewElement(parentWhiteboard, option, `${windows[winIdx].componentID}-tab`, x, y)

        option.addEventListener('mouseover', () => {
            const pos = elementPositions.get(option.id)
            option.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(2)`
        })
        option.addEventListener('mouseleave', () => {
            const pos = elementPositions.get(option.id)
            option.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(1)`
        })
        
        ++winIdx
    }
}

function generateAllTabsMenuCircles(centerX, centerY, amount, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0, windows){
    const circleCaps = getTabsMenuCircleCaps(amount)

    let radiusExt = 0, angleOffsetExt = 0, i = 0
    circleCaps.forEach(cap => {
        generateSingleTabsMenuCircle(centerX, centerY, cap, 360 / cap, radius + radiusExt, angleOffset + angleOffsetExt, xOffset, yOffset, windows, i)
        radiusExt += 250
        angleOffsetExt += 45
        i += cap
    })
}

function toggleChildrenFilter(container, cssFunction){
    Array.from(container.children).forEach(el => {
        if(!el.classList.contains('open-window'))
            el.style.filter = cssFunction
    })
}

function openTabsMenu(mousePos, windows){
    turnOffContextMenu()
    toggleChildrenFilter(parentWhiteboard, 'blur(3px)')
    generateAllTabsMenuCircles(mousePos.x, mousePos.y, windows.length, 162, 250, 0, 0, -10, windows)
    windows.forEach(w => {
        // console.log(w, windows.length)
    })

    StatesHandler.isTabsMenuOpen = true;
}

function closeTabsMenu(){
    const allWindowOptions = document.querySelectorAll('.open-window')

    allWindowOptions.forEach(w => {
        w.remove()
        elementPositions.delete(w.id)
    })
    toggleChildrenFilter(parentWhiteboard, 'none')
    StatesHandler.isTabsMenuOpen = false;
}