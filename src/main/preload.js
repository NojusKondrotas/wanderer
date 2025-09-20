const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wandererAPI', {
  firstTimeNotepadChosen: () => ipcRenderer.invoke('first-time-notepad-chosen'),
  firstTimeWhiteboardChosen: () => ipcRenderer.invoke('first-time-whiteboard-chosen'),

  saveWhiteboardHTML: () => {
    const html = document.documentElement.outerHTML
    ipcRenderer.send('save-whiteboard-html', html)
  },
  saveWhiteboardState: (stateObj) => {
    ipcRenderer.send('save-whiteboard-state', stateObj)
  },
  loadWhiteboardState: () => ipcRenderer.invoke('load-whiteboard-state'),
  saveNotepadHTML: () => {
    const html = document.documentElement.outerHTML
    ipcRenderer.send('save-notepad-html', html)
  },

  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
  setMinimized: () => ipcRenderer.invoke('set-minimized'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openTitlebarContextMenu: (callback) => ipcRenderer.on('open-titlebar-context-menu',
    (event, mousePos, boundsOffset) => callback(mousePos, boundsOffset)),
  setMousePosition: (x, y) => {
    ipcRenderer.invoke('set-mouse-position', x, y)
  },

  addNotepad: () => ipcRenderer.invoke('add-notepad'),
  openNotepad: (notepadID) => ipcRenderer.invoke('open-notepad', notepadID),
  addWhiteboard: () => ipcRenderer.invoke('add-whiteboard'),
  openWhiteboard: (whiteboardID) => ipcRenderer.invoke('open-whiteboard', whiteboardID),

  saveQuillDelta: (contents) => ipcRenderer.invoke('save-quill-delta', contents),
  loadQuillDelta: () => ipcRenderer.invoke('load-quill-delta'),
})

ipcRenderer.on('app-before-quit', () => {
  const html = document.documentElement.outerHTML
  ipcRenderer.send('save-html', html)
})