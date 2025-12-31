const abstracts = [
    document.getElementById('cfg-abst-templates'),
    document.getElementById('cfg-abst-n'),
    document.getElementById('cfg-abst-w'),
    document.getElementById('cfg-abst-p'),
    document.getElementById('cfg-abst-internal')
];
let activeAbstract = null;

function placeConfigAbstract(abstract) {
    if(activeAbstract != null)
        toggleConfigAbstract(false);
    const rect = abstract.getBoundingClientRect();
    abstract.style.transform = `translate(${contextMenuCenter.x - rect.width / 2}px, ${contextMenuCenter.y - rect.height / 2}px)`;
    activeAbstract = abstract;
}

function toggleConfigAbstract(flag, abstract = null) {
    if (flag) {
        placeConfigAbstract(abstract);
        abstract.style.display = 'block';
    } else {
        activeAbstract.style.display = 'none';
        activeAbstract = null;
    }
}