const abstracts = [
    document.getElementById('cfg-abst-templates'),
    document.getElementById('cfg-abst-n'),
    document.getElementById('cfg-abst-w'),
    document.getElementById('cfg-abst-p'),
    document.getElementById('cfg-abst-internal')
];
let activeAbstract = null;
const abstractZIndex = 20;

function toggleConfigAbstract(flag, abstract = null) {
    if (flag) {
        abstract.style.display = 'block';
        abstract.style.zIndex = abstractZIndex + 1;
        showCMChild(contextMenuCenter.x, contextMenuCenter.y, abstract);
        activeAbstract = abstract;
    } else {
        if(activeAbstract == null) return;
        concealCMChild(activeAbstract);
        activeAbstract.style.zIndex = abstractZIndex;
        setTimeout((currAbst) => {
            currAbst.style.display = 'none';
            currAbst = null;
        }, timeoutCM, activeAbstract);
    }
}