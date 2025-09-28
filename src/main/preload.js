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
  onTerminateWindow: (callback) => ipcRenderer.on('terminate-window', (_) => callback()),
  onSaveComponent: (callback) => ipcRenderer.on('save-component', (_) => callback()),

  setFullScreen: () => ipcRenderer.invoke('set-fullscreen'),
  setMaximized: () => ipcRenderer.invoke('set-maximized'),
  setMinimized: () => ipcRenderer.invoke('set-minimized'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openTitlebarContextMenu: (callback) => ipcRenderer.on('open-titlebar-context-menu',
    (_, mousePos, boundsOffset) => callback(mousePos, boundsOffset)
  ),
  openTabMenu: (callback) => ipcRenderer.on('open-tab-menu',
    (_, windows) => callback(windows)
  ),
  setMousePosition: (x, y) => {
    ipcRenderer.invoke('set-mouse-position', x, y)
  },
  moveWindow: (x, y, width, height) => ipcRenderer.invoke('move-window', { x, y, width, height }),

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