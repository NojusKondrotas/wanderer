const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')

let main_window
function initialiseApp(){
    const savesPath = path.join(__dirname, '..', 'saves', 'index.html')
    const defaultPath = path.join(__dirname, 'index.html')
    const entryFile = fs.existsSync(savesPath) ? savesPath : defaultPath

    main_window = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    main_window.loadFile(entryFile)
}

app.whenReady().then(() => {
    initialiseApp()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) initialiseApp()
    })

    globalShortcut.register('CmdOrCtrl+B', () => main_window.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), main_window.getBounds()))
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})

ipcMain.on('save-html', (e, html) => {
    const saveDir = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(saveDir)){
        fs.mkdirSync(saveDir)
    }
    const filePath = path.join(saveDir, 'index.html')
    fs.writeFileSync(filePath, html, 'utf-8')
})

ipcMain.on('save-state', (e, stateObj) => {
    const saveDir = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(saveDir))
        fs.mkdirSync(saveDir)

    const serializedElements = Array.from(stateObj.elementOffsets, ([id, offset]) => ({ id, x: offset.x, y: offset.y }))

    const dataToSave = {
        totalElements: stateObj.totalElements,
        totalPaths: stateObj.totalPaths,
        boardOffset: stateObj.boardOffset,
        elementOffsets: serializedElements,
        allPaths: stateObj.allPaths,
        isTitlebarLocked: stateObj.isTitlebarLocked,
    }

    const filePath = path.join(saveDir, 'save-data.json')
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8')
})

ipcMain.handle('load-state', () => {
    const savePath = path.join(__dirname, '..', 'saves', 'save-data.json')
    if (fs.existsSync(savePath))
        return JSON.parse(fs.readFileSync(savePath, 'utf-8'))
    return {}
})

ipcMain.handle('is-fullscreen', () => {
  return main_window.isFullScreen()
})

ipcMain.handle('is-maximized', () => main_window.isMaximized())

ipcMain.handle('set-fullscreen', (e, flag) => main_window.setFullScreen(flag))

ipcMain.handle('set-maximized', (e, flag) => {
    if(flag) main_window.maximize()
    else main_window.unmaximize()
})

ipcMain.handle('close-window', () => main_window.close())