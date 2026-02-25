import { setSelectedElement } from "../../instantiable-components/component-handler.js";
import { setSelectedPath } from "../../instantiable-components/path.js";
import { generateCircularLayout } from "../../runtime/layout.js";
import { generateRandom, Vector2D } from "../../runtime/numerics.js";
import { AppStates } from "../../runtime/states-handler.js";

const allContextMenus = Array.from(document.getElementsByClassName('cm-logic'));
export const borderColorCM = { opaque: "rgb(10, 10, 10)", transparent: "rgba(10, 10, 10, 0)" }
export const colorCM = { opaque: "rgb(10, 10, 10)", transparent: "rgba(10, 10, 10, 0)" }
export const timeoutCM = 170

export let activeContextMenu: HTMLElement | null = null, contextMenuCenter = new Vector2D(0, 0);
export const setActiveContextMenu = (cm) => activeContextMenu = cm;
export const setContextMenuCenter = (pos: Vector2D) => contextMenuCenter = pos; 

export function showCMChild(x: number, y: number, option: HTMLElement){
    const offsetX = generateRandom(-50, 50);
    const offsetY = generateRandom(-50, 50);

    option.style.left = `${x + offsetX}px`;
    option.style.top = `${y + offsetY}px`;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            option.style.left = `${x}px`
            option.style.top = `${y}px`
            option.style.borderColor = borderColorCM.opaque
            option.style.color = colorCM.opaque
            option.style.backdropFilter = 'blur(2px) opacity(1)';
            option.style.boxShadow = '0px 0px 15px -8px rgba(0, 0, 0, 0.77)';
        })
    })
}

function moveContextMenu(centerX: number, centerY: number, blueprint: HTMLElement){
    blueprint.style.left = `${centerX}px`
    blueprint.style.top = `${centerY}px`
}

export function concealCMChild(option: HTMLElement, { x_lower = -50, x_higher = 50 } = {}, { y_lower = -50, y_higher = -50 } = {}){
    const offsetX = generateRandom(x_lower, x_higher);
    const offsetY = generateRandom(y_lower, y_higher);
    option.style.left = `${option.offsetLeft + offsetX}px`;
    option.style.top = `${option.offsetTop + offsetY}px`;
    option.style.borderColor = borderColorCM.transparent;
    option.style.color = colorCM.transparent;
    option.style.backdropFilter = 'blur(2px) opacity(0)';
    option.style.boxShadow = '0px 0px 15px -8px rgba(0, 0, 0, 0)';
}

export function concealContextMenuChildren(cm: HTMLElement){
    Array.from(cm.children as HTMLCollectionOf<HTMLElement>).forEach((option) => {
        concealCMChild(option);
    });
}

function concealContextMenu(){
    for(let cm of allContextMenus){
        if(cm !== activeContextMenu){
            concealContextMenuChildren(cm as HTMLElement)
            setTimeout(() => (cm as HTMLElement).style.display = 'none', timeoutCM)
        }
    }
}

function forgetContextMenuSelection(){
    setSelectedElement(null)
    setSelectedPath(null)
}

export function forgetContextMenus(){
    activeContextMenu = null
    concealContextMenu()
    AppStates.isContextMenuOpen = false
}

export function turnOffContextMenu(){
    forgetContextMenus()
    forgetContextMenuSelection()
}

export function openNewContextMenu(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset = 0, yOffset = 0 }){
    if(activeContextMenu === blueprint){
        setContextMenuCenter(new Vector2D(centerX, centerY))
        return moveContextMenu(centerX, centerY, blueprint);
    }
    activeContextMenu = blueprint
    concealContextMenu()
    blueprint.style.display = 'block'
    AppStates.isContextMenuOpen = true
    setContextMenuCenter(new Vector2D(centerX, centerY))
    generateCircularLayout(centerX, centerY, { blueprint, angleSize, radius, angleOffset, xOffset, yOffset })
}

function genMouseMove_ContextMenuHandler(e){
    if (!AppStates.isContextMenuOpen || !activeContextMenu) return

    Array.from(activeContextMenu.children).forEach(ctrl => {
        const rect = ctrl.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))

        if (distance > 100) {
            (ctrl as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)'
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
        (ctrl as HTMLElement).style.transform = `translate(-50%, -50%) scale(${factor})`
    })
}