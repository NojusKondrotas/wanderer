function generateCircularLayout(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0 }){
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
                option.style.boxShadow = '0px 0px 15px -8px rgba(0, 0, 0, 0.77)';
            })
        })
    })
}

function generateLadderLayout(originX, originY, { blueprint, gapSize }, xOffset = -145, yOffset = -100){
    blueprint.style.left = `${originX}px`
    blueprint.style.top = `${originY}px`

    let prevChild = null;
    let totalY = blueprint.offsetTop + yOffset;
    Array.from(blueprint.children).forEach((option, i) => {
        const x = xOffset;
        let y = i * gapSize + yOffset;
        if(prevChild != null){
            createPath(document.body, { x: blueprint.offsetLeft, y: totalY - gapSize },
                { x: blueprint.offsetLeft, y: totalY },
                prevChild.id, option.id, false, false, false);
        }
        totalY += gapSize + option.offsetHeight;
        prevChild = option;

        const offsetX = generateRandom(-50, 50)
        const offsetY = generateRandom(-50, 50)

        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`
    })

    prevChild = null;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            Array.from(blueprint.children).forEach((option, i) => {
                const x = xOffset;
                let y = i * gapSize + yOffset;
                if(prevChild != null){
                    y += prevChild.offsetHeight;
                }
                prevChild = option;

                option.style.left = `${x}px`
                option.style.top = `${y}px`
                option.style.borderColor = borderColorCM.opaque
                option.style.color = colorCM.opaque
                option.style.backdropFilter = 'blur(2px) opacity(1)';
                option.style.boxShadow = '0px 0px 15px -8px rgba(0, 0, 0, 0.77)';
            })
        })
    })
}

function getMultiCircularCaps(amount){
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

async function generateSingleMultiCircularLayoutCircle(centerX, centerY, amount, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0, windows, previews, winIdx){
    for(let i = 0; i < amount; ++i){
        const option = document.createElement('button')
        option.classList.add('option-control-style')
        option.classList.add('open-window')

        const preview = document.createElement('img')
        const idDiv = document.createElement('div')
        preview.alt = windows[winIdx].componentID
        idDiv.textContent = windows[winIdx].componentID

        const dataUrl = previews[winIdx];
        preview.src = dataUrl

        option.appendChild(preview)
        option.appendChild(idDiv)

        const angleDeg = angleOffset + i * angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = centerX + radius * Math.cos(angleRad) + xOffset
        let y = centerY + radius * Math.sin(angleRad) + yOffset

        createNewElement(wbZoom, option, `${windows[winIdx].componentID}-tab`, x, y)

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

function generateMultiCircularLayout(centerX, centerY, amount, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0, windows, previews){
    const circleCaps = getMultiCircularCaps(amount)

    let radiusExt = 0, angleOffsetExt = 0, i = 0
    circleCaps.forEach(cap => {
        generateSingleMultiCircularLayoutCircle(centerX, centerY, cap, 360 / cap, radius + radiusExt, angleOffset + angleOffsetExt, xOffset, yOffset, windows, previews, i)
        radiusExt += 250
        angleOffsetExt += 45
        i += cap
    })
}