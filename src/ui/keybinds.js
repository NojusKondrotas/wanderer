const pressedKeys = new Set()

const keybinds = [
  ['Shift', 'W'],
  ['Shift', 'S'],
  ['Alt', 'ArrowDown'],
  ['Alt', 'ArrowLeft'],
  ['Alt', 'ArrowRight'],
  ['Alt', 'ArrowUp'],
]

const windowDragKeybind = 0
const windowResizeKeybind = 1
const noteWriteFocusDown = 2
const noteWriteFocusLeft = 3
const noteWriteFocusRight = 4
const noteWriteFocusUp = 5

window.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key)
}, { capture: true })

window.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key)
}, { capture: true })

function isCombo(combo) {
  return combo.every(key => pressedKeys.has(key))
}