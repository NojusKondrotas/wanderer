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
        gapSize: 5
    },
    {
        blueprint: document.getElementById('cfg-menu-n'),
        gapSize: 5
    },
    {
        blueprint: document.getElementById('cfg-menu-w'),
        gapSize: 5
    },
    {
        blueprint: document.getElementById('cfg-menu-p'),
        gapSize: 5
    },
    {
        blueprint: document.getElementById('cfg-menu-internal'),
        gapSize: 5
    }
];
let activeMenuLadder = null;

(function addConfigsEventListeners() {
    for(let i = 0; i < sections.length; ++i) {
        const section = sections[i];
        if (section != null) {
            section.addEventListener('mousedown', () => {
                displayConfigMenu(menusLadders[i]);
            });
            section.addEventListener('mouseenter', () => {
                toggleConfigInfoTag(true, section);
                activeSectionIdx = i;
            });
        } else {
            // throw error, irrecoverable state !!
        }
    }
})();

function generateLadderLayout(originX, originY, { blueprint, gapSize }){
    blueprint.style.left = `${originX}px`
    blueprint.style.top = `${originY}px`

    let prevChild = null;
    Array.from(blueprint.children).forEach((option, i) => {
        const x = 0;
        let y = i * gapSize;
        if(prevChild != null){
            y += prevChild.offsetHeight + option.offsetHeight / 2;
            let prevChildY = prevChild.offsetTop + prevChild.offsetHeight;
            createPath(document.body, { x: blueprint.offsetLeft, y: blueprint.offsetTop + prevChildY },
                { x: blueprint.offsetLeft, y: blueprint.offsetTop + y },
                prevChild.id, option.id, false, false, false);
        }
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
            const x = 0;
            let y = i * gapSize;
            if(prevChild != null){
                y += prevChild.offsetHeight + option.offsetHeight / 2;
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

function hideConfigMenu() {

}

function displayConfigMenu(menu) {
    if(activeMenuLadder != null){
        activeMenuLadder.blueprint.style.display = 'none';
        document.querySelectorAll('.path-container').forEach(c => {
            c.remove();
        })
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