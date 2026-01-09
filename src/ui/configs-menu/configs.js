const configsMenu = document.getElementById('configs');
const configscm = {
    blueprint : configsMenu,
    angleSize : 360 / configsMenu.children.length,
    radius : 200,
    angleOffset : 162,
    xOffset : -10,
    yOffset : -10
};
const sections = [
    document.getElementById('cfg-templates'),
    document.getElementById('cfg-n'),
    document.getElementById('cfg-w'),
    document.getElementById('cfg-p'),
    document.getElementById('cfg-internal')
];
const sectionsBorderColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const sectionsColor = { opaque: "rgb(10, 10, 10)", transparent: "transparent" };
const timeoutCfg = 100;
let activeSectionIdx = -1;
const menusLadders = [
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
let activeMenuLadder = null;

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

function hideConfigMenu() {
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

function displayConfigMenu(menu) {
    if(activeMenuLadder != null){
        hideConfigMenu();
    }
    activeMenuLadder = menu;
    menu.blueprint.style.display = 'block'
    generateLadderLayout(contextMenuCenter.x, contextMenuCenter.y, menu);
}

function hideConfigs() {
    return new Promise(resolve => {
        sections.forEach(section => {
            const offsetX = generateRandom(-50, 50);
            const offsetY = generateRandom(-50, 50);
            section.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            section.style.borderColor = sectionsBorderColor.transparent;
            section.style.color = sectionsColor.transparent;
        });
        setTimeout(() => {
            configsDiv.style.display = 'none';
            resolve();
        }, timeoutCfg)
        cfgBlur.style.backdropFilter = 'blur(4px) opacity(0)';
        toggleConfigAbstract(false);
        toggleConfigInfoTag(false);
    });
}

function displayConfigs(x, y) {
    configscm.blueprint.style.display = 'block'
    contextMenuCenter = { x, y }
    generateCircularLayout(x, y, configscm);
}