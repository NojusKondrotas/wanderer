import { generateCircularLayout, generateLadderLayout, offsetAppearanceSingular, placeAppearanceSingular, situateAppearanceSingular } from "../../runtime/layout.js";
import { generateRandom, translateToElementMiddle } from "../../runtime/numerics.js";
import { Vector2D } from "../../runtime/vector-2d.js";
import { concealContextMenuChildren, contextMenuCenter, ContextMenuRegister, createContextMenu, createContextMenuCircular, IContextMenu, IContextMenuCircular, setContextMenuCenter, timeoutCM } from "../context-menus/handler-context-menu.js";

let configsDiv: HTMLElement, configsSections: HTMLElement[];

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
        document.getElementById('cfg-i')
    ];

    if(sections.some((v) => !v)) {
        throw new Error("Some section(s) not found, cannot proceed");
    }

    configsDiv = configsDivLocal;
    configsSections = sections as HTMLElement[];
}

export function registerConfigsFunctionalCM(identifier: string) {
    const cm = document.getElementById('configs');

    if(cm)
        return ContextMenuRegister.registerContextMenu(
            identifier,
            createContextMenuCircular(
                createContextMenu(
                    cm,
                    (cm.children) as HTMLCollectionOf<HTMLElement>,
                    -10, -10
                ),
                360 / cm.children.length,
                200,
                162
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

export function displayConfigs(x, y) {
    configsDiv.style.display = 'block';
    setContextMenuCenter(new Vector2D(x, y))
    const coords = [
        translateToElementMiddle(configsSections[0], new Vector2D(x - 800, y - 600)),
        translateToElementMiddle(configsSections[1], new Vector2D(x - 400, y - 300)),
        translateToElementMiddle(configsSections[2], new Vector2D(x, y)),
        translateToElementMiddle(configsSections[3], new Vector2D(x + 400, y + 300)),
        translateToElementMiddle(configsSections[4], new Vector2D(x + 800, y + 600)),
    ]

    placeAppearanceSingular(configsSections[0], coords[0]);
    placeAppearanceSingular(configsSections[1], coords[1]);
    placeAppearanceSingular(configsSections[2], coords[2]);
    placeAppearanceSingular(configsSections[3], coords[3]);
    placeAppearanceSingular(configsSections[4], coords[4]);

    // generateCircularLayout(coords[0], )
}