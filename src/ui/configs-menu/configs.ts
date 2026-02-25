import { generateCircularLayout, generateLadderLayout } from "../../runtime/layout.js";
import { generateRandom, Vector2D } from "../../runtime/numerics.js";
import { concealContextMenuChildren, contextMenuCenter, setContextMenuCenter, timeoutCM } from "../context-menus/handler-context-menu.js";
import { toggleConfigAbstract } from "./config-abstract.js";
import { toggleConfigInfoTag } from "./config-info-tag.js";

const configsMenu = document.getElementById('configs')!
export const configscm = {
    blueprint : configsMenu,
    angleSize : 360 / configsMenu.children.length,
    radius : 200,
    angleOffset : 162,
    xOffset : -10,
    yOffset : -10
};
export const sections = [
    document.getElementById('cfg-templates'),
    document.getElementById('cfg-n'),
    document.getElementById('cfg-w'),
    document.getElementById('cfg-p'),
    document.getElementById('cfg-internal')
];
const sectionsBorderColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const sectionsColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const timeoutCfg = 100;
export let activeSectionIdx = -1;
export const setActiveSectionIdx = (idx) => activeSectionIdx = idx;
export const menusLadders = [
    {
        blueprint: document.getElementById('cfg-menu-templates'),
        gapSize: 10
    },
    {
        blueprint: document.getElementById('cfg-menu-n'),
        gapSize: 10
    },
    {
        blueprint: document.getElementById('cfg-menu-w'),
        gapSize: 10
    },
    {
        blueprint: document.getElementById('cfg-menu-p'),
        gapSize: 10
    },
    {
        blueprint: document.getElementById('cfg-menu-internal'),
        gapSize: 10
    }
];
let activeMenuLadder;

(function addConfigsEventListeners() {
    sections.forEach((section, i) => {
        if (section != null) {
            section.addEventListener('mouseenter', () => {
                toggleConfigInfoTag(true, section);
                activeSectionIdx = i;
            });
        } else {
            // throw error, irrecoverable state !!
        }
    });
})();

export function hideConfigMenu() {
    if(activeMenuLadder == null) return;
    concealContextMenuChildren(activeMenuLadder.blueprint);
    setTimeout((currActiveMenu) => {
        currActiveMenu.blueprint.style.display = 'none';
    }, timeoutCM, activeMenuLadder);
    document.querySelectorAll('.path-container').forEach(c => {
        c.remove();
    })
    activeMenuLadder = null;
}

export function displayConfigMenu(menu) {
    if(activeMenuLadder != null){
        hideConfigMenu();
    }
    activeMenuLadder = menu;
    menu.blueprint.style.display = 'block'
    generateLadderLayout(contextMenuCenter.x, contextMenuCenter.y, menu);
}

function hideConfigs() {
    return new Promise<void>(resolve => {
        sections.forEach(section => {
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
        // cfgBlur.style.backdropFilter = 'blur(4px) opacity(0)';
        toggleConfigAbstract(false);
        toggleConfigInfoTag(false);
    });
}

export function displayConfigs(x, y) {
    configscm.blueprint.style.display = 'block'
    setContextMenuCenter(new Vector2D(x, y))
    generateCircularLayout(x, y, configscm);
}