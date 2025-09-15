const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const robot = require('@hurdlegroup/robotjs')

function terminateApp(){
    const windows = BrowserWindow.getAllWindows().map(win => {
        win.webContents.send('terminate-app')
        const bounds = win.getBounds()
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isMain: win === main_window,
            isFullscreen: win.isFullScreen(),
            isMinimized: win.isMinimized(),
        }
    })

    const saveDir = path.join(__dirname, '..', 'saves')
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir)
    const windowsFilePath = path.join(saveDir, 'windows.json')
    fs.writeFileSync(windowsFilePath, JSON.stringify(windows, null, 2), 'utf-8')
    app.quit()
}

let main_window
function initialiseApp(){
    const savesPath = path.join(__dirname, '..', 'saves', 'index.html')
    const savesNotepadsPath = path.join(__dirname, '..', 'saves', 'notepads')
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

    globalShortcut.register('CmdOrCtrl+1', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if(focusedWindow) focusedWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), focusedWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+num1', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if(focusedWindow) focusedWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), focusedWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+2', () => {
        terminateApp()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})

ipcMain.on('save-html', (e, html) => {
    const saveDir = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(saveDir)){
        fs.mkdirSync(saveDir)
    }
    const saveNotepadDir = path.join(saveDir, 'notepads')
    if(!fs.existsSync(saveNotepadDir)){
        fs.mkdirSync(saveNotepadDir)
    }

    let filePath
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow && focusedWindow === main_window) {
        filePath = path.join(saveDir, 'index.html')
        fs.writeFileSync(filePath, html, 'utf-8')
    }
})

ipcMain.on('save-state', (e, stateObj) => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if(focusedWindow && focusedWindow !== main_window) return
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
    const saveJSONPath = path.join(__dirname, '..', 'saves', 'save-data.json')
    if (fs.existsSync(saveJSONPath))
        return JSON.parse(fs.readFileSync(saveJSONPath, 'utf-8'))
    return {}
})

ipcMain.handle('set-mouse-position', (e, x, y) => {
    robot.moveMouse(x, y)
})

ipcMain.handle('is-fullscreen', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if(focusedWindow) focusedWindow.isFullScreen()
})

ipcMain.handle('set-fullscreen', (e, flag) => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if(focusedWindow) focusedWindow.setFullScreen(flag)
})

ipcMain.handle('set-minimized', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if(focusedWindow) focusedWindow.minimize()
})

ipcMain.handle('close-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.close()
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const savesPath = path.join(__dirname, '..', 'saves', 'notepads', `${notepadID}.html`)
    const defaultPath = path.join(__dirname, 'index.html')
    const entryFile = fs.existsSync(savesPath) ? savesPath : defaultPath

    const notepadWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    notepadWindow.loadFile(entryFile)
})
