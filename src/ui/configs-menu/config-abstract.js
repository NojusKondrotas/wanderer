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
        if(activeAbstract.id === 'cfg-abst-templates') concealCMChild(activeAbstract,
            { x_lower: -35, x_higher: 35 }, { y_lower: -35, y_higher: 35 }
        );
        else if(activeAbstract.id === 'cfg-abst-internal') concealCMChild(activeAbstract,
            { x_lower: -20, x_higher: 20 }, { y_lower: -20, y_higher: 20 }
        );
        else concealCMChild(activeAbstract);
        activeAbstract.style.zIndex = abstractZIndex;
        setTimeout((currAbst) => {
            currAbst.style.display = 'none';
        }, timeoutCM, activeAbstract);
    }
}