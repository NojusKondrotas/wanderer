const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let whiteboard, isWhiteboardTitlebarLocked = false;
function initialiseApp(){
    whiteboard = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false,
        // titleBarStyle: 'hidden',
        // fullscreen: true
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    whiteboard.loadFile('index.html')
}

app.whenReady().then(() => {
    initialiseApp()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) initialiseApp()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})

ipcMain.handle('is-fullscreen', () => {
  return whiteboard.isFullScreen()
})

ipcMain.handle('is-maximized', () => whiteboard.isMaximized())

ipcMain.handle('set-fullscreen', (e, flag) => whiteboard.setFullScreen(flag))

ipcMain.handle('set-maximized', (e, flag) => {
    if(flag) whiteboard.maximize()
    else whiteboard.unmaximize()
})

ipcMain.handle('close-window', () => whiteboard.close())

ipcMain.handle('is-titlebar-locked', () => isWhiteboardTitlebarLocked)

ipcMain.handle('toggle-titlebar-lock', (e, flag) => {
    if(flag) return // logic
    else return // logic
})