const configsDiv = document.getElementById('configs');
const sections = [
    document.getElementById('cfg-templates'),
    document.getElementById('cfg-n'),
    document.getElementById('cfg-w'),
    document.getElementById('cfg-p'),
    document.getElementById('cfg-internal')
];
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

}

function displayAllConfigs() {

}