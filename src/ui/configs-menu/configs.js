const configsDiv = document.getElementById('configs');
const cfgBlur = document.getElementById('cfg-blur');
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
        StatesHandler.isConfigsOpen = false;
    });
}

function displayAllConfigs() {
    turnOffContextMenu();
    configsDiv.style.display = 'flex';
    sections.forEach(section => {
        const offsetX = generateRandom(-50, 50);
        const offsetY = generateRandom(-50, 50);
        section.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        section.style.borderColor = sectionsBorderColor.transparent;
        section.style.color = sectionsColor.transparent;
    });
    requestAnimationFrame(() => {
        sections.forEach(section => {
            section.style.transform = 'translate(0, 0)';
            section.style.borderColor = sectionsBorderColor.opaque;
            section.style.color = sectionsColor.opaque;
        });
    });
    cfgBlur.style.backdropFilter = 'blur(4px) opacity(1)';
    StatesHandler.isConfigsOpen = true;
}