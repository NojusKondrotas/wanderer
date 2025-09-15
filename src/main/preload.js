const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wandererAPI', {
  saveHTML: () => {
    const html = document.documentElement.outerHTML
    ipcRenderer.send('save-html', html)
  },
  saveState: (stateObj) => {
    ipcRenderer.send('save-state', stateObj)
  },
  loadState: () => ipcRenderer.invoke('load-state'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
  setMinimized: () => ipcRenderer.invoke('set-minimized'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openTitlebarContextMenu: (callback) => ipcRenderer.on('open-titlebar-context-menu',
    (event, mousePos, boundsOffset) => callback(mousePos, boundsOffset)),
  setMousePosition: (x, y) => {
    ipcRenderer.invoke('set-mouse-position', x, y)
  },
  openNotepad: (notepadID) => ipcRenderer.invoke('open-notepad', notepadID)
})

ipcRenderer.on('app-before-quit', () => {
  const html = document.documentElement.outerHTML
  ipcRenderer.send('save-html', html)
})