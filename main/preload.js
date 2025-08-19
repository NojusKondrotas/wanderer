const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wandererAPI', {
  saveHTML: () => {
    const html = document.documentElement.outerHTML
    ipcRenderer.send('save-html', html)
  },
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  setMaximized: (flag) => ipcRenderer.invoke('set-maximized', flag),
  closeWindow: () => ipcRenderer.invoke('close-window'),
})

ipcRenderer.on('app-before-quit', () => {
  const html = document.documentElement.outerHTML
  ipcRenderer.send('save-html', html)
})