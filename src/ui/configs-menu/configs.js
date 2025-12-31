const configsMenu = document.getElementById('configs');
const configscm = {
    blueprint : configsMenu,
    angleSize : 360 / configsMenu.children.length,
    radius : 150,
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
const menus = [
    document.getElementById('cfg-menus-templates'),
    document.getElementById('cfg-menus-n'),
    document.getElementById('cfg-menus-w'),
    document.getElementById('cfg-menus-p'),
    document.getElementById('cfg-menus-internal')
];

(function addConfigsEventListeners() {
    for(let i = 0; i < sections.length; ++i) {
        const section = sections[i];
        if (section != null) {
            section.addEventListener('click', () => {
                displaySingleConfigMenu(section);
            });
            section.addEventListener('mouseenter', () => {
                toggleSingleConfigInfoTag(true, section);
                activeSectionIdx = i;
            });
        } else {
            // throw error, irrecoverable state !!
        }
    }
})();

function hideSingleConfigMenu() {

}

function displaySingleConfigMenu() {

}

function hideAllConfigs() {
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
        toggleAllConfigsAbstracts(false);
        toggleSingleConfigInfoTag(false);
    });
}

function displayAllConfigs(x, y) {
    configscm.blueprint.style.display = 'block'
    generateCircularContextMenu(x, y, configscm);
}