const abstracts = [
    document.getElementById('configs-abstract-templates'),
    document.getElementById('configs-abstract-notes'),
    document.getElementById('configs-abstract-whiteboards'),
    document.getElementById('configs-abstract-notepads'),
    document.getElementById('configs-abstract-internal')
];

function toggleAllConfigsAbstracts(flag) {
    
}

function toggleSingleConfigAbstract(flag, abstract) {
    if (flag) {
        abstract.style.display = 'block';
    } else {
        abstract.style.display = 'none';
    }
}