const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wandererAPI', {
  logMessage: (message) => ipcRenderer.send('log-message', message),
  openLink: (link) => ipcRenderer.invoke('open-link', link),
  getLink: () => ipcRenderer.invoke('get-link'),
  getWindowPreview: (symbolicWindowID) => ipcRenderer.invoke('get-window-preview', symbolicWindowID),
  firstTimeNotepadChosen: () => ipcRenderer.invoke('first-time-notepad-chosen'),
  firstTimeWhiteboardChosen: () => ipcRenderer.invoke('first-time-whiteboard-chosen'),

  getWindowComponentID: () => ipcRenderer.invoke('get-window-component-id'),

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
  onSaveComponent: (callback) => ipcRenderer.once('save-component', callback),
  saveComponentDone: () => ipcRenderer.send('save-component-done'),

  setFullScreen: () => ipcRenderer.invoke('set-fullscreen'),
  setMaximized: () => ipcRenderer.invoke('set-maximized'),
  setMinimized: () => ipcRenderer.invoke('set-minimized'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openTitlebarContextMenu: (callback) => ipcRenderer.on('open-titlebar-context-menu',
    (_, mousePos) => callback(mousePos)
  ),
  openTabMenu: (callback) => ipcRenderer.on('open-tab-menu',
    (_, mousePos, windows) => callback(mousePos, windows)
  ),
  closeTabMenu: (callback) => ipcRenderer.on('close-tab-menu',
    () => callback()
  ),
  closeTabMenuDone: () => ipcRenderer.send('close-tab-menu-done'),
  setMousePosition: (x, y) => {
    ipcRenderer.invoke('set-mouse-position', x, y)
  },
  moveWindow: (x, y, width, height) => ipcRenderer.invoke('move-window', { x, y, width, height }),
  zoomInWindow: (callback) => ipcRenderer.on('zoom-in-window',
    (_, mousePos) => callback(mousePos)),
  zoomOutWindow: (callback) => ipcRenderer.on('zoom-out-window',
    (_, mousePos) => callback(mousePos)),

  addNotepad: () => ipcRenderer.invoke('add-notepad'),
  openNotepad: (notepadID) => ipcRenderer.invoke('open-notepad', notepadID),
  addWhiteboard: () => ipcRenderer.invoke('add-whiteboard'),
  openWhiteboard: (whiteboardID) => ipcRenderer.invoke('open-whiteboard', whiteboardID),

  saveEditorContents: (contents) => ipcRenderer.invoke('save-editor-contents', contents),
  loadEditorContents: () => ipcRenderer.invoke('load-editor-contents'),
})