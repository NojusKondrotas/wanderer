const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const robot = require('@hurdlegroup/robotjs')

const allWindowTypes = new Map()

function createWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600){
    const window = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen: fullscreen,
        webPreferences: {
            preload: path.join(preloadFilePath),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })
    window.loadFile(entryFilePath)

    return window
}

function createWhiteboardWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600){
    const window = createWindow(entryFilePath, preloadFilePath, fullscreen, width, height)
    allWindowTypes.set(window.id, 'w')
    return window
}

function createNotepadWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600){
    const window = createWindow(entryFilePath, preloadFilePath, fullscreen, width, height)
    allWindowTypes.set(window.id, 'p')
    return window
}

function writeWindows(){
    const whiteboardSavesDirPath = path.join(__dirname, '..', 'saves', 'whiteboards')
    const windows = BrowserWindow.getAllWindows().map(win => {
        const bounds = win.getBounds()
        const winType = allWindowTypes.get(win.id)
        switch(winType){
            case 'p':
                //handle
                break
            case 'w':
                
                break
        }

        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isFullscreen: win.isFullScreen(),
            isMinimized: win.isMinimized(),
            id: win.id,
            type: allWindowTypes.get(win.id)
        }
    })
    const windowsFilePath = path.join(__dirname, '..', 'saves', 'windows.json')
    fs.writeFileSync(windowsFilePath, JSON.stringify(windows, null, 2), 'utf-8')
}

function terminateApp(){
    const windows = BrowserWindow.getAllWindows().map(win => {
        const bounds = win.getBounds()
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isFullscreen: win.isFullScreen(),
            isMinimized: win.isMinimized(),
            id: win.id,
            type: allWindowTypes.get(win.id)
        }
    })

    const saveDir = path.join(__dirname, '..', 'saves')
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir)
    writeWindows()
    app.quit()
}

function initialiseApp(){
    const savesPath = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(savesPath)) fs.mkdirSync(savesPath)

    const savesNotepadsPath = path.join(savesPath, 'notepads.json')
    if(!fs.existsSync(savesNotepadsPath))
        fs.writeFileSync(savesNotepadsPath, JSON.stringify({}, null, 2), 'utf-8')

    const savesWhiteboardsPath = path.join(savesPath, 'whiteboards')
    if(!fs.existsSync(savesWhiteboardsPath))
        fs.mkdirSync(savesWhiteboardsPath)

    const defaultWhiteboardPathIndex = path.join(__dirname, 'whiteboard-index.html')
    if(!fs.existsSync(defaultWhiteboardPathIndex))
        process.exit

    const defaultPathPreload = path.join(__dirname, 'preload.js')
    if(!fs.existsSync(defaultPathPreload))
        process.exit

    const windowsJSON = path.join(savesPath, 'windows.json')
    if(!fs.existsSync(windowsJSON))
        fs.writeFileSync(windowsJSON, JSON.stringify([], null, 2), 'utf-8')

    const windowsObj = JSON.parse(fs.readFileSync(windowsJSON, 'utf-8'))
    if(Array.isArray(windowsObj) && windowsObj.length > 0){
        for(let i = windowsObj.length - 1; i >= 0; i--){
            const win = windowsObj[i]
            allWindowTypes.set(win.id, win.type)
            switch(win.type){
                case 'n':
                    createNotepadWindow() // handle
                case 'w':
                    createWhiteboardWindow() // handle
            }
        }
    }else{
        createWindow(path.join(__dirname, 'first-time', 'first-time.html'), defaultPathPreload, true)
    }
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

ipcMain.handle('first-time-notepad-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    console.log(`window id: ${senderWindow.id}`)
    senderWindow.loadFile(path.join(__dirname, 'notepad-index.html'))
    allWindowTypes.set(senderWindow.id, 'p')
})

ipcMain.handle('first-time-whiteboard-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    console.log(`window id: ${senderWindow.id}`)
    senderWindow.loadFile(path.join(__dirname, 'whiteboard-index.html'))
    allWindowTypes.set(senderWindow.id, 'w')
})

ipcMain.on('save-whiteboard-html', (e, html) => {
    const saveDir = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(saveDir)){
        fs.mkdirSync(saveDir)
    }
    const saveNotepadDir = path.join(saveDir, 'notepads')
    if(!fs.existsSync(saveNotepadDir)){
        fs.mkdirSync(saveNotepadDir)
    }

    let filePath
    // const focusedWindow = BrowserWindow.getFocusedWindow()
    // if (focusedWindow && focusedWindow === main_window) {
        filePath = path.join(saveDir, 'whiteboard-index.html')
        fs.writeFileSync(filePath, html, 'utf-8')
    // }
})

ipcMain.on('save-whiteboard-state', (e, stateObj) => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    // if(focusedWindow && focusedWindow !== main_window) return
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

ipcMain.handle('load-whiteboard-state', () => {
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

ipcMain.handle('close-window', (e) => {
    const windows = BrowserWindow.getAllWindows()
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    if(windows.length === 1){
        writeWindows()
    }
    senderWindow.close()
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const savesPath = path.join(__dirname, '..', 'saves', 'notepads', `${notepadID}.html`)
    const defaultPath = path.join(__dirname, 'notepad-index.html')
    const entryFile = fs.existsSync(savesPath) ? savesPath : defaultPath

    const notepadWindow = createNotepadWindow(entryFile, path.join(__dirname, 'preload.js'))
})
