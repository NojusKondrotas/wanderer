export const pressedKeys = new Set()

export const keybinds = [
  ['Shift', 'W'],
  ['Shift', 'S'],
  ['Alt', 'ArrowDown'],
  ['Alt', 'ArrowLeft'],
  ['Alt', 'ArrowRight'],
  ['Alt', 'ArrowUp'],
]

export enum KeybindIndices {
  windowDragKeybind = 0,
  windowResizeKeybind,
  noteWriteFocusDown,
  noteWriteFocusLeft,
  noteWriteFocusRight,
  noteWriteFocusUp
}

export function isCombo(combo) {
  return combo.every(key => pressedKeys.has(key))
}