const configsDiv = document.getElementById('configs');
const sections = [
    document.getElementById('configs-templates'),
    document.getElementById('configs-notes'),
    document.getElementById('configs-whiteboards'),
    document.getElementById('configs-notepads'),
    document.getElementById('configs-internal')
];
const abstracts = [
    document.getElementById('configs-abstract-templates'),
    document.getElementById('configs-abstract-notes'),
    document.getElementById('configs-abstract-whiteboards'),
    document.getElementById('configs-abstract-notepads'),
    document.getElementById('configs-abstract-internal')
];
const menus = [
    document.getElementById('configs-menus-templates'),
    document.getElementById('configs-menus-notes'),
    document.getElementById('configs-menus-whiteboards'),
    document.getElementById('configs-menus-notepads'),
    document.getElementById('configs-menus-internal')
];

(function addConfigsEventListeners() {
    sections.forEach((section) => {
        if (section != null) {
            section.addEventListener('click', () => {
                displaySingleConfigMenu(section);
            });
            section.addEventListener('mouseenter', () => {
                toggleSingleConfigInfoTag(true, section);
            });
        } else {
            // throw error, irrecoverable state !!
        }
    });
})();

function hideSingleConfigMenu() {

}

function displaySingleConfigMenu() {

}

function hideAllConfigs() {

}

function displayAllConfigs() {

}

function toggleAllConfigsAbstracts(flag) {
    
}

function toggleSingleConfigAbstract(flag) {

}