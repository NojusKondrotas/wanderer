const abstracts = [
    document.getElementById('cfg-abst-templates'),
    document.getElementById('cfg-abst-n'),
    document.getElementById('cfg-abst-w'),
    document.getElementById('cfg-abst-p'),
    document.getElementById('cfg-abst-internal')
];

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
    } else {
        abstracts[abstractIdx].style.display = 'none';
        abstractsExits[abstractIdx].style.display = 'none';
    }
}