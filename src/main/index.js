const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const robot = require('@hurdlegroup/robotjs')

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

    globalShortcut.register('CmdOrCtrl+1', () => main_window.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), main_window.getBounds()))
    globalShortcut.register('CmdOrCtrl+num1', () => main_window.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), main_window.getBounds()))
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

    const serializedElements = Array.from(stateObj.elementPositions, ([id, pos]) => ({ id, x: pos.x, y: pos.y }))
    const serializedallQuillToolbars = Array.from(stateObj.allQuillToolbars, ([id, quill]) => ({ id, quill }))
    
    const dataToSave = {
        largestElementID: stateObj.largestElementID,
        unusedElementIDs: stateObj.unusedElementIDs,
        largestPathID: stateObj.largestPathID,
        unusedPathIDs: stateObj.unusedPathIDs,
        largestQlEditorID: stateObj.largestQlEditorID,
        unusedQlEditorIDs: stateObj.unusedQlEditorIDs,
        elementPositions: serializedElements,
        allPaths: stateObj.allPaths,
        allQuillToolbars: serializedallQuillToolbars,
        isTitlebarLocked: stateObj.isTitlebarLocked,
        isFullscreen: stateObj.isFullscreen,
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

ipcMain.handle('set-mouse-position', (e, x, y) => {
    robot.moveMouse(x, y)
})

ipcMain.handle('is-fullscreen', () => main_window.isFullScreen())

ipcMain.handle('set-fullscreen', (e, flag) => main_window.setFullScreen(flag))

ipcMain.handle('set-minimized', () => {
    main_window.minimize()
})

ipcMain.handle('close-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.close()
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const savesPath = path.join(__dirname, '..', 'saves', 'notepads', `${notepadID}.html`)
    const defaultPath = path.join(__dirname, 'index.html')
    const entryFile = fs.existsSync(savesPath) ? savesPath : defaultPath

    // Create a new window without affecting the main window
    const notepadWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen: false, // Not fullscreen to distinguish from main window
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    notepadWindow.loadFile(entryFile)
})
