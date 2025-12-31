const abstracts = [
    document.getElementById('cfg-abst-templates'),
    document.getElementById('cfg-abst-n'),
    document.getElementById('cfg-abst-w'),
    document.getElementById('cfg-abst-p'),
    document.getElementById('cfg-abst-internal')
];

function toggleConfigAbstract(flag, abstractIdx) {
    if (flag) {
        abstracts[abstractIdx].style.display = 'block';
    } else {
        abstracts[abstractIdx].style.display = 'none';
    }
}