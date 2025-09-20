const pressedKeys = new Set()

const keybind = ['ShiftLeft', 'KeyW']

window.addEventListener('keydown', (e) => {
    pressedKeys.add(e.code)
})

window.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.code)
})

function isCombo(combo) {
  return combo.every(code => pressedKeys.has(code));
}