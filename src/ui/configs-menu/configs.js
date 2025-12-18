const sections = [
    document.getElementById('configs-templates'),
    document.getElementById('configs-notes'),
    document.getElementById('configs-whiteboards'),
    document.getElementById('configs-notepads'),
    document.getElementById('configs-internal')
];

function addConfigsEventListeners() {
    sections.forEach((section) => {
        if (section != null) {
            section.addEventListener('click', () => {
                displaySingleConfigMenu(section);
            });
            section.addEventListener('mouseenter', () => {
                toggleSingleConfigInfoTag(true);
            });
            section.addEventListener('mouseleave', () => {
                toggleSingleConfigInfoTag(false);
            });
        } else {
            // throw error, irrecoverable state !!
        }
    });
}

function hideSingleConfigMenu() {

}

function displaySingleConfigMenu() {

}

function hideAllConfigs() {

}

function displayAllConfigs() {

}

function toggleSingleConfigInfoTag(flag) {

}

function toggleSingleConfigAbstract(flag) {

}