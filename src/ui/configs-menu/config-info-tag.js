const configsInfoTag = document.getElementById('cfg-itag');
const configsInfoTagField = document.getElementById('cfg-itag-field');

(function addConfigsInfoTagListeners() {
    configsInfoTag.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    configsInfoTag.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleConfigAbstract(false);
        toggleConfigAbstract(true, abstracts[activeSectionIdx]);
    });
    configsInfoTagField.addEventListener('mousedown', () => {
        toggleConfigInfoTag(false);
        activeSectionIdx = -1;
    });
    configsInfoTagField.addEventListener('mouseleave', () => {
        toggleConfigInfoTag(false);
        activeSectionIdx = -1;
    });
})();

function placeConfigInfoTag(element) {
    const configsInfoTagRect = configsInfoTag.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const { left: x, top: y } = rect;

    const xTag = rect.width + 33;
    const yTag = rect.height / 2 + 11;
    configsInfoTag.style.left = `${xTag}px`;
    configsInfoTag.style.top = `${yTag}px`;
    configsInfoTagField.style.left = `${x - 11}px`;
    configsInfoTagField.style.top = `${y + yTag - 11}px`;
    configsInfoTagField.style.width = `${xTag + configsInfoTagRect.width * 2 + 22}px`;
    configsInfoTagField.style.height = `${rect.height + 22}px`;
}

function toggleConfigInfoTag(flag, section=null) {
    if (flag) {
        configsInfoTag.style.display = 'block';
        configsInfoTagField.style.display = 'block';
        placeConfigInfoTag(section);
    } else {
        configsInfoTag.style.display = 'none';
        configsInfoTagField.style.display = 'none';
    }
}