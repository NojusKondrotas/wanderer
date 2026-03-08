import { createNewElement, elementPositions } from "../instantiable-components/component-handler.js";
import { createPath } from "../instantiable-components/path.js";
import { borderColorCM, colorCM, IContextMenuCircular } from "../ui/context-menus/handler-context-menu.js";
import { wbZoom } from "../ui/parent-whiteboard-handler.js";
import { generateRandom } from "./numerics.js";
import { Vector2D } from "./vector-2d.js";

export function offsetAppearanceSingular(el: HTMLElement, v: Vector2D) {
    const offsetX = generateRandom(-50, 50)
    const offsetY = generateRandom(-50, 50)
    
    el.style.left = `${v.x + offsetX}px`
    el.style.top = `${v.y + offsetY}px`
}

export function situateAppearanceSingular(el: HTMLElement, v: Vector2D) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.style.left = `${v.x}px`
            el.style.top = `${v.y}px`
            el.style.borderColor = borderColorCM.opaque
            el.style.color = colorCM.opaque
            el.style.backdropFilter = 'blur(2px) opacity(1)';
            el.style.boxShadow = '0px 0px 15px -8px rgba(0, 0, 0, 0.77)';
        })
    })
}

export function offsetAppearanceCircular(els: HTMLCollectionOf<HTMLElement>, cm: IContextMenuCircular) {
    Array.from(els).forEach((option, i) => {
        const angleDeg = cm.angleOffset + i * cm.angleSize
        const angleRad = angleDeg * Math.PI / 180

        let x = cm.radius * Math.cos(angleRad) + cm.xOffset
        let y = cm.radius * Math.sin(angleRad) + cm.yOffset

        const offsetX = generateRandom(-50, 50)
        const offsetY = generateRandom(-50, 50)

        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`
    })
}

export function situateAppearanceCircular(els: HTMLCollectionOf<HTMLElement>, cm: IContextMenuCircular) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            Array.from(els).forEach((option, i) => {
                const angleDeg = cm.angleOffset + i * cm.angleSize
                const angleRad = angleDeg * Math.PI / 180
                const x = cm.radius * Math.cos(angleRad) + cm.xOffset
                const y = cm.radius * Math.sin(angleRad) + cm.yOffset

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

export function generateCircularLayout(center: Vector2D, cm: IContextMenuCircular){
    cm.container.style.left = `${center.x}px`
    cm.container.style.top = `${center.y}px`

    const children: HTMLCollectionOf<HTMLElement> = cm.options;

    offsetAppearanceCircular(children, cm);

    situateAppearanceCircular(children, cm);
}

export function generateLadderLayout(origin: Vector2D, { blueprint, gapSize }, xOffset = -145, yOffset = -100){
    blueprint.style.left = `${origin.x}px`
    blueprint.style.top = `${origin.y}px`

    let prevChild: HTMLElement | null = null;
    let totalY = blueprint.offsetTop + yOffset;
    Array.from(blueprint.children as HTMLCollectionOf<HTMLElement>).forEach((option, i) => {
        const x = xOffset;
        let y = i * gapSize + yOffset;
        if(prevChild != null){
            createPath(document.body, { x: blueprint.offsetLeft, y: totalY - gapSize },
                { x: blueprint.offsetLeft, y: totalY },
                prevChild.id, option.id, false, false, false);
        }
        totalY += gapSize + option.offsetHeight;
        prevChild = option as HTMLElement;

        const offsetX = generateRandom(-50, 50)
        const offsetY = generateRandom(-50, 50)

        option.style.left = `${x + offsetX}px`
        option.style.top = `${y + offsetY}px`
    })

    prevChild = null;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            Array.from(blueprint.children as HTMLCollectionOf<HTMLElement>).forEach((option, i) => {
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

function getMultiCircularCaps(amount: number){
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

async function generateSingleMultiCircularLayoutCircle(center: Vector2D, amount: number,
    angleSize: number, radius: number, angleOffset: number,
    xOffset = 0, yOffset = 0, windows, previews, winIdx){
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

        let x = center.x + radius * Math.cos(angleRad) + xOffset
        let y = center.y + radius * Math.sin(angleRad) + yOffset

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

export function generateMultiCircularLayout(center: Vector2D, amount, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0, windows, previews){
    const circleCaps = getMultiCircularCaps(amount)

    let radiusExt = 0, angleOffsetExt = 0, i = 0
    circleCaps.forEach(cap => {
        generateSingleMultiCircularLayoutCircle(center, cap, 360 / cap, radius + radiusExt, angleOffset + angleOffsetExt, xOffset, yOffset, windows, previews, i)
        radiusExt += 250
        angleOffsetExt += 45
        i += cap
    })
}