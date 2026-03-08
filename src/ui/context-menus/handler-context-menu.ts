import { setSelectedElement } from "../../instantiable-components/component-handler.js";
import { setSelectedPath } from "../../instantiable-components/path.js";
import { generateCircularLayout } from "../../runtime/layout.js";
import { generateRandom } from "../../runtime/numerics.js";
import { AppStates } from "../../runtime/states-handler.js";
import { Vector2D } from "../../runtime/vector-2d.js";

export const borderColorCM = { opaque: "rgb(10, 10, 10)", transparent: "rgba(10, 10, 10, 0)" }
export const colorCM = { opaque: "rgb(10, 10, 10)", transparent: "rgba(10, 10, 10, 0)" }
export const timeoutCM = 170

export let activeContextMenu: IContextMenu | null = null, contextMenuCenter = new Vector2D(0, 0);
export const setActiveContextMenu = (cm: IContextMenu) => activeContextMenu = cm;
export const setContextMenuCenter = (pos: Vector2D) => contextMenuCenter = pos;

export interface IContextMenu {
    container: HTMLElement,
    options: HTMLCollectionOf<HTMLElement>,
    xOffset: number,
    yOffset: number
}

export interface IContextMenuLinear extends IContextMenu {
    gapSize: number
}

export interface IContextMenuCircular extends IContextMenu {
    angleSize: number,
    radius: number,
    angleOffset: number
}

export function createContextMenu(container: HTMLElement, options: HTMLCollectionOf<HTMLElement>,
    xOffset: number, yOffset: number) {
    return {
        container, options, xOffset, yOffset
    } satisfies IContextMenu;
}

export function createContextMenuLinear(cm: IContextMenu, gapSize: number): IContextMenuLinear {
    return {
        ...cm,
        gapSize
    } satisfies IContextMenuLinear;
}

export function createContextMenuCircular(cm: IContextMenu, angleSize: number, radius: number, angleOffset: number): IContextMenuCircular {
    return {
        ...cm,
        angleSize,
        radius,
        angleOffset
    } satisfies IContextMenuCircular;
}

export class ContextMenuRegister implements Iterable<IContextMenu> {
    private static menus: Map<string, IContextMenu> = new Map();

    static registerContextMenu(identifier: string, cm: IContextMenu) {
        this.menus.set(identifier, cm);
    }

    static unregisterContextMenu(identifier: string) {
        this.menus.delete(identifier);
    }

    static getContextMenu(identifier: string) {
        return this.menus.get(identifier);
    }

    [Symbol.iterator](): Iterator<IContextMenu> {
        return ContextMenuRegister.menus.values();
    }

    static concealContextMenus() {
        for(const [id, cm] of this.menus){
            if(cm !== activeContextMenu){
                concealContextMenuChildren(cm.options)
                setTimeout(() => (cm.container).style.display = 'none', timeoutCM)
            }
        }
    }
}

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

function moveContextMenu(centerX: number, centerY: number, cm: IContextMenu){
    cm.container.style.left = `${centerX}px`
    cm.container.style.top = `${centerY}px`
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

export function concealContextMenuChildren(children: HTMLCollectionOf<HTMLElement>){
    Array.from(children).forEach((option) => {
        concealCMChild(option);
    });
}

function forgetContextMenuSelection(){
    setSelectedElement(null)
    setSelectedPath(null)
}

export function forgetContextMenus(){
    activeContextMenu = null
    ContextMenuRegister.concealContextMenus()
    AppStates.isContextMenuOpen = false
}

export function turnOffContextMenu(){
    forgetContextMenus()
    forgetContextMenuSelection()
}

export function openNewContextMenu(centerX, centerY, identifier: string){
    const cm = ContextMenuRegister.getContextMenu(identifier);
    if(!cm) {
        throw new Error("context menu that's ought to be open must be registered");
    }
    if(activeContextMenu === cm){
        setContextMenuCenter(new Vector2D(centerX, centerY))
        return moveContextMenu(centerX, centerY, cm);
    }
    activeContextMenu = cm
    ContextMenuRegister.concealContextMenus()
    cm.container.style.display = 'block'
    AppStates.isContextMenuOpen = true
    setContextMenuCenter(new Vector2D(centerX, centerY))
    if(cm['angleSize']) {
        generateCircularLayout(new Vector2D(centerX, centerY), cm as IContextMenuCircular);
    }
}

export function genMouseMove_ContextMenuHandler(e){
    if (!AppStates.isContextMenuOpen || !activeContextMenu) return

    Array.from(activeContextMenu.options).forEach(ctrl => {
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