const abstracts = [
    document.getElementById('cfg-abst-templates'),
    document.getElementById('cfg-abst-n'),
    document.getElementById('cfg-abst-w'),
    document.getElementById('cfg-abst-p'),
    document.getElementById('cfg-abst-internal')
];
const abstractsExits = [
    document.getElementById('cfg-abst-templates-exit'),
    document.getElementById('cfg-abst-n-exit'),
    document.getElementById('cfg-abst-w-exit'),
    document.getElementById('cfg-abst-p-exit'),
    document.getElementById('cfg-abst-internal-exit')
];

(function addCfgAbstExitListeners() {
    for(let i = 0; i < abstractsExits.length; ++i){
        const exit = abstractsExits[i];
        exit.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        exit.addEventListener('click', (e) => {
            e.stopPropagation();
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
    if (flag) {
        abstracts.forEach(abstract => abstract.style.display = 'block');
        abstractsExits.forEach(exit => exit.style.display = 'block');
    } else {
        abstracts.forEach(abstract => abstract.style.display = 'none');
        abstractsExits.forEach(exit => exit.style.display = 'none');
    }
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