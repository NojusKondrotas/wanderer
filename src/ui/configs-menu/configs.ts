import { generateCircularLayout, placeAppearanceSingular, styleOpenCMOpt } from "../../runtime/layout.js";
import { generateRandom, translateToElementMiddle } from "../../runtime/numerics.js";
import { Vector2D } from "../../runtime/vector-2d.js";
import { ContextMenuRegister, createContextMenu, createContextMenuCircular, IContextMenuCircular, setContextMenuCenter } from "../context-menus/handler-context-menu.js";

let configsDiv: HTMLElement, configsSections: HTMLElement[];

let functionalMenu: HTMLElement, noteMenu: HTMLElement, whiteboardMenu: HTMLElement, notepadMenu: HTMLElement, pathMenu: HTMLElement, internalMenu: HTMLElement;

export const cfgfcm = "cfgfcm";
export const cfgncm = "cfgncm";
export const cfgwcm = "cfgwcm";
export const cfgpcm = "cfgpcm";
export const cfgacm = "cfgacm";
export const cfgicm = "cfgicm";

export function initConfigsContainer() {
    const configsDivLocal = document.getElementById('configs');

    if(!configsDivLocal) {
        throw new Error("Configs div #configs not found");
    }

    const sections = [
        document.getElementById('cfg-f'),
        document.getElementById('cfg-n'),
        document.getElementById('cfg-w'),
        document.getElementById('cfg-p'),
        document.getElementById('cfg-a'),
        document.getElementById('cfg-i')
    ];

    if(sections.some(v => !v)) {
        throw new Error("Some section(s) not found, cannot proceed");
    }

    const menus = [
        document.getElementById('f-menu'),
        document.getElementById('n-menu'),
        document.getElementById('w-menu'),
        document.getElementById('p-menu'),
        document.getElementById('a-menu'),
        document.getElementById('i-menu')
    ];

    if(menus.some(v => !v)) {
        throw new Error("Some section menu(s) not found, cannot proceed");
    }

    configsDiv = configsDivLocal;
    configsSections = sections as HTMLElement[];

    [functionalMenu, noteMenu, whiteboardMenu, notepadMenu, pathMenu, internalMenu] = menus as HTMLElement[];
}

export function registerConfigsFunctionalCM(identifier: string) {
    const opts = functionalMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                functionalMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            150,
            0
        )
    );
}

export function registerConfigsNoteCM(identifier: string) {
    const opts = noteMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                noteMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            200,
            0
        )
    );
}

export function registerConfigsWhiteboardCM(identifier: string) {
    const opts = whiteboardMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                whiteboardMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            200,
            0
        )
    );
}

export function registerConfigsNotepadCM(identifier: string) {
    const opts = notepadMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                notepadMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            200,
            0
        )
    );
}

export function registerConfigsPathCM(identifier: string) {
    const opts = pathMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                pathMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            200,
            0
        )
    );
}

export function registerConfigsInternalCM(identifier: string) {
    const opts = internalMenu.getElementsByTagName('button');
    return ContextMenuRegister.registerContextMenu(
        identifier,
        createContextMenuCircular(
            createContextMenu(
                internalMenu,
                opts,
                -10, -10
            ),
            360 / opts.length,
            200,
            135
        )
    );
}

const sectionsBorderColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const sectionsColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const timeoutCfg = 100;

function hideConfigs() {
    return new Promise<void>(resolve => {
        configsSections.forEach(section => {
            const offsetX = generateRandom(-50, 50);
            const offsetY = generateRandom(-50, 50);
            section!.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            section!.style.borderColor = sectionsBorderColor.transparent;
            section!.style.color = sectionsColor.transparent;
        });
        setTimeout(() => {
            // configsDiv.style.display = 'none';
            resolve();
        }, timeoutCfg)
    });
}

export function displayConfigs(v: Vector2D) {
    configsDiv.style.display = 'block';
    setContextMenuCenter(v)
    const coords = {
        cfgfcm: translateToElementMiddle(configsSections[0], new Vector2D(v.x - 800, v.y - 600)),
        cfgncm: translateToElementMiddle(configsSections[1], new Vector2D(v.x - 400, v.y - 300)),
        cfgwcm: translateToElementMiddle(configsSections[2], new Vector2D(v.x, v.y)),
        cfgpcm: translateToElementMiddle(configsSections[3], new Vector2D(v.x + 400, v.y + 300)),
        cfgacm: translateToElementMiddle(configsSections[4], new Vector2D(v.x + 800, v.y + 600)),
        cfgicm: translateToElementMiddle(configsSections[4], new Vector2D(v.x + 1200, v.y + 900)),

        [Symbol.iterator](): Iterator<[string, Vector2D]> {
            const entries = Object.entries(this).filter(([k]) =>
                k !== Symbol.iterator.toString()) as [string, Vector2D][];

            let i = 0;
            return {
                next(): IteratorResult<[string, Vector2D]> {
                    return i < entries.length
                        ? { value: entries[i++], done: false }
                        : { value: undefined as any, done: true }
                }
            }
        }
    };

    let i = 0;
    for(let [k, v] of coords) {
        placeAppearanceSingular(configsSections[i++], v, styleOpenCMOpt);
    }

    for(let [k, v] of coords) {
        generateCircularLayout(v, ContextMenuRegister.getContextMenu(k) as IContextMenuCircular, styleOpenCMOpt);
    }
}