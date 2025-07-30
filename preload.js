const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wandererAPI', {
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  setMaximized: (flag) => ipcRenderer.invoke('set-maximized', flag),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isTitlebarLocked: () => ipcRenderer.invoke('is-titlebar-locked'),
  toggleTitlebarLock: (flag) => ipcRenderer.invoke('toggle-titlebar-lock', flag),
})
