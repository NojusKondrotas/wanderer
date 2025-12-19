const configsDiv = document.getElementById('configs');
const sections = [
    document.getElementById('configs-templates'),
    document.getElementById('configs-notes'),
    document.getElementById('configs-whiteboards'),
    document.getElementById('configs-notepads'),
    document.getElementById('configs-internal')
];
let activeSectionIdx = -1;
const menus = [
    document.getElementById('configs-menus-templates'),
    document.getElementById('configs-menus-notes'),
    document.getElementById('configs-menus-whiteboards'),
    document.getElementById('configs-menus-notepads'),
    document.getElementById('configs-menus-internal')
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