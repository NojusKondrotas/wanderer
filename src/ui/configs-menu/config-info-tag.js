const configsInfoTag = document.getElementById('cfg-itag');
const configsInfoTagField = document.getElementById('cfg-itag-field');

(function addConfigsInfoTagListeners() {
    configsInfoTag.addEventListener('click', () => {
        toggleSingleConfigAbstract(true, activeSectionIdx);
    });
    configsInfoTagField.addEventListener('mouseleave', () => {
        toggleSingleConfigInfoTag(false);
        activeSectionIdx = -1;
    });
})();

function placeConfigInfoTag(element) {
    const configsInfoTagRect = configsInfoTag.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const { x, y } = convertToWhiteboardSpace(rect.left, rect.top);

    const xTag = rect.width + 33;
    const yTag = rect.height / 2 + 11;
    configsInfoTag.style.left = `${xTag}px`;
    configsInfoTag.style.top = `${yTag}px`;
    configsInfoTagField.style.left = `${x - 11}px`;
    configsInfoTagField.style.top = `${y + yTag - 11}px`;
    configsInfoTagField.style.width = `${xTag + configsInfoTagRect.width * 2 + 22}px`;
    configsInfoTagField.style.height = `${rect.height + 22}px`;
}

function toggleSingleConfigInfoTag(flag, section=null) {
    if (flag) {
        configsInfoTag.style.display = 'block';
        configsInfoTagField.style.display = 'block';
        placeConfigInfoTag(section);
    } else {
        configsInfoTag.style.display = 'none';
        configsInfoTagField.style.display = 'none';
    }
}