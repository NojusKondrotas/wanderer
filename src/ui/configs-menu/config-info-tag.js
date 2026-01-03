const configsInfoTag = document.getElementById('cfg-itag');
const configsInfoTagField = document.getElementById('cfg-itag-field');

(function addConfigsInfoTagListeners() {
    configsInfoTag.addEventListener('click', (e) => {
        e.stopPropagation();
        hideConfigMenu();
        toggleConfigAbstract(false);
        toggleConfigAbstract(true, abstracts[activeSectionIdx]);
    });
    document.body.addEventListener('click', () => {
        toggleConfigInfoTag(false);
        hideConfigMenu();
        toggleConfigAbstract(false);
        activeSectionIdx = -1;
    });
    configsInfoTagField.addEventListener('click', (e) => {
        e.stopPropagation();
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const found = els.find(el => el.classList.contains('cfg-sect'));
        if(found == null) return;
        let i = 0;
        for(; i < sections.length; ++i){
            if(sections[i] === found) break;
        }
        toggleConfigAbstract(false);
        displayConfigMenu(menusLadders[i]);
    })
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