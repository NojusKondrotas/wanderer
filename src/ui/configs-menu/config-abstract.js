const abstracts = [
    document.getElementById('configs-abstract-templates'),
    document.getElementById('configs-abstract-notes'),
    document.getElementById('configs-abstract-whiteboards'),
    document.getElementById('configs-abstract-notepads'),
    document.getElementById('configs-abstract-internal')
];
const abstractsExits = [
    document.getElementById('cg-abst-templates-exit'),
    document.getElementById('cg-abst-n-exit'),
    document.getElementById('cg-abst-w-exit'),
    document.getElementById('cg-abst-np-exit'),
    document.getElementById('cg-abst-internal-exit')
];

(function addCfgAbstExitListeners() {
    for(let i = 0; i < abstractsExits.length; ++i){
        const exit = abstractsExits[i];
        exit.addEventListener('click', () => {
            toggleSingleConfigAbstract(false, i);
        });
    }
})();

function placeConfigAbstractExit(abstract, exit) {
    const rect = abstract.getBoundingClientRect();
    const { x, y } = convertToWhiteboardSpace(rect.left, rect.top);

    exit.style.left = `${x + rect.width}px`;
    exit.style.top = `${y}px`;
}

function toggleAllConfigsAbstracts(flag) {
    
}

function toggleSingleConfigAbstract(flag, abstractIdx) {
    if (flag) {
        abstracts[abstractIdx].style.display = 'block';
        abstractsExits[abstractIdx].style.display = 'block';
        placeConfigAbstractExit(abstracts[abstractIdx], abstractsExits[abstractIdx]);
    } else {
        abstracts[abstractIdx].style.display = 'none';
        abstractsExits[abstractIdx].style.display = 'none';
    }
}