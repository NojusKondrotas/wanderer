const pressedKeys = new Set()

const keybinds = [['ShiftLeft', 'KeyW'], ['ShiftLeft', 'KeyS']]
const windowDragKeybind = 0
const windowResizeKeybind = 1

window.addEventListener('keydown', (e) => {
    pressedKeys.add(e.code)
})

window.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.code)
})

function isCombo(combo) {
  return combo.every(code => pressedKeys.has(code))
}