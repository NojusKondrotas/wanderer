const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const robot = require('@hurdlegroup/robotjs')
const { send } = require('process')

const allWindowTypes = new Map(), windowToComponentMapping = new Map()
const allNotepads = new Set(), allWhiteboards = new Set()

let largestNotepadID = 0, unusedNotepadIDs = new Array()
let largestWhiteboardID = 0, unusedWhiteboardIDs = new Array()

function getNotepadID(){
    if(unusedNotepadIDs.length !== 0)
        return unusedNotepadIDs.pop()
    else{
        ++largestNotepadID
        return `notepad-${largestNotepadID - 1}`
    }
}

function getWhiteboardID(){
    if(unusedWhiteboardIDs.length !== 0)
        return unusedWhiteboardIDs.pop()
    else{
        ++largestWhiteboardID
        return `whiteboard-${largestWhiteboardID - 1}`
    }
}

function initialiseNotepadWindow(windowID, notepadID){
    allWindowTypes.set(windowID, 'p')
    let id
    if(!allNotepads.has(notepadID)){
        id = getNotepadID()
        allNotepads.add(id)
    }else{
        id = notepadID
    }
    windowToComponentMapping.set(windowID, id)
}

function initialiseWhiteboardWindow(windowID, whiteboardID){
    allWindowTypes.set(windowID, 'w')
    let id
    if(!allWhiteboards.has(whiteboardID)){
        id = getWhiteboardID()
        allWhiteboards.add(id)
    }else{
        id = whiteboardID
    }
    windowToComponentMapping.set(windowID, id)
}

function createWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600){
    const window = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen,
        webPreferences: {
            preload: path.join(preloadFilePath),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })
    window.loadFile(entryFilePath)

    return window
}

function createWhiteboardWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600, whiteboardID){
    const window = createWindow(entryFilePath, preloadFilePath, fullscreen, width, height)
    initialiseWhiteboardWindow(window.id, whiteboardID)
    return window
}

function createNotepadWindow(entryFilePath, preloadFilePath, fullscreen = false, width = 800, height = 600, notepadID){
    const window = createWindow(entryFilePath, preloadFilePath, fullscreen, width, height)
    initialiseNotepadWindow(window.id, notepadID)
    return window
}

function writeWindows(){
    const windows = BrowserWindow.getAllWindows()
    const map = new Array()
    for(let i = windows.length - 1; i >= 0; --i){
        const win = windows[i]
        const bounds = win.getBounds()
        const winSaved = {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isFullscreen: win.isFullScreen(),
            isMinimized: win.isMinimized(),
            type: allWindowTypes.get(win.id),
            componentID: windowToComponentMapping.get(win.id)
        }
        map.push(winSaved)
    }
    const windowsFilePath = path.join(__dirname, '..', 'saves', 'windows.json')
    fs.writeFileSync(windowsFilePath, JSON.stringify(map, null, 2), 'utf-8')
}

function terminateApp(){
    writeWindows()
    app.quit()
}

function initialiseApp(){
    const savesPath = path.join(__dirname, '..', 'saves')
    if(!fs.existsSync(savesPath)) fs.mkdirSync(savesPath)

    const savesNotepadsPath = path.join(savesPath, 'notepads')
    if(!fs.existsSync(savesNotepadsPath))
        fs.mkdirSync(savesNotepadsPath)

    const savesWhiteboardsPath = path.join(savesPath, 'whiteboards')
    if(!fs.existsSync(savesWhiteboardsPath))
        fs.mkdirSync(savesWhiteboardsPath)

    const defaultWhiteboardPathIndex = path.join(__dirname, 'whiteboard-index.html')
    if(!fs.existsSync(defaultWhiteboardPathIndex))
        process.exit

    const defaultNotepadPathIndex = path.join(__dirname, 'notepad-index.html')
    if(!fs.existsSync(defaultNotepadPathIndex))
        process.exit

    const defaultPathPreload = path.join(__dirname, 'preload.js')
    if(!fs.existsSync(defaultPathPreload))
        process.exit

    const windowsJSON = path.join(savesPath, 'windows.json')
    if(!fs.existsSync(windowsJSON))
        fs.writeFileSync(windowsJSON, JSON.stringify([], null, 2), 'utf-8')

    const windowsObj = JSON.parse(fs.readFileSync(windowsJSON, 'utf-8'))
    if(Array.isArray(windowsObj) && windowsObj.length > 0){
        for(let i = 0; i < windowsObj.length; ++i){
            const winData = windowsObj[i]
            switch(winData.type){
                case 'p':
                    win = createNotepadWindow(defaultNotepadPathIndex, defaultPathPreload, winData.isFullscreen, winData.width, winData.height, winData.componentID)
                    break
                case 'w':
                    const filePath = path.join(savesWhiteboardsPath, `${winData.componentID}`, `${winData.componentID}-index.html`)
                    win = createWhiteboardWindow(filePath, defaultPathPreload, winData.isFullscreen, winData.width, winData.height, winData.componentID)
                    break
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

    globalShortcut.register('CmdOrCtrl+1', (e) => {
        const senderWindow = BrowserWindow.fromWebContents(e.sender)
        senderWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), senderWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+num1', (e) => {
        const senderWindow = BrowserWindow.fromWebContents(e.sender)
        senderWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), senderWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+2', () => {
        terminateApp()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})

ipcMain.handle('add-notepad', async (e) => {
    const id = getNotepadID()
    allNotepads.add(id)
    return id
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${notepadID}.json`)
    if(!fs.existsSync(savesJSON))
        fs.writeFileSync(savesJSON, JSON.stringify({}, null, 2), 'utf-8')
    const defaultHTML = path.join(__dirname, 'notepad-index.html')

    const notepadWindow = createNotepadWindow(defaultHTML, path.join(__dirname, 'preload.js'),
    false, undefined, undefined, notepadID)
})

ipcMain.handle('save-quill-delta', (e, contents) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${windowToComponentMapping.get(senderWindow.id)}.json`)
    fs.writeFileSync(savesJSON, JSON.stringify(contents, null, 2), 'utf-8')
})

ipcMain.handle('load-quill-delta', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${windowToComponentMapping.get(senderWindow.id)}.json`)
    if(!fs.existsSync(savesJSON))
        fs.writeFileSync(savesJSON, JSON.stringify({}, null, 2), 'utf-8')

    return savesJSON
})

ipcMain.handle('first-time-notepad-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    senderWindow.loadFile(path.join(__dirname, 'notepad-index.html'))
    initialiseNotepadWindow(senderWindow.id, getNotepadID())
})

ipcMain.handle('first-time-whiteboard-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    console.log(`window id: ${senderWindow.id}`)
    senderWindow.loadFile(path.join(__dirname, 'whiteboard-index.html'))
    allWindowTypes.set(senderWindow.id, 'w')
    const id = getWhiteboardID()
    allWhiteboards.add(id)
    windowToComponentMapping.set(senderWindow.id, id)
})

ipcMain.on('save-whiteboard-html', (e, html) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const componentID = windowToComponentMapping.get(senderWindow.id)
    const saveWhiteboardDir = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`)
    if(!fs.existsSync(saveWhiteboardDir)){
        fs.mkdirSync(saveWhiteboardDir)
    }
    const saveWhiteboardHTML = path.join(saveWhiteboardDir, `${componentID}-index.html`)
    if (!html.includes('../../../')) {
        html = html.replace(/((?:src|href)=["'])\.\.\//g, '$1../../../')
    }
    fs.writeFileSync(saveWhiteboardHTML, html, 'utf-8')
})

ipcMain.on('save-whiteboard-state', (e, stateObj) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const componentID = windowToComponentMapping.get(senderWindow.id)
    const saveWhiteboardDir = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`)
    if(!fs.existsSync(saveWhiteboardDir)){
        fs.mkdirSync(saveWhiteboardDir)
    }

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

    const saveWhiteboardState = path.join(saveWhiteboardDir, `${componentID}-state.json`)
    fs.writeFileSync(saveWhiteboardState, JSON.stringify(dataToSave, null, 2), 'utf-8')
})

ipcMain.handle('load-whiteboard-state', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const componentID = windowToComponentMapping.get(senderWindow.id)
    const saveWhiteboardState = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`,  `${componentID}-state.json`)
    if (fs.existsSync(saveWhiteboardState))
        return JSON.parse(fs.readFileSync(saveWhiteboardState, 'utf-8'))
    return {}
})

ipcMain.handle('set-mouse-position', (e, x, y) => {
    robot.moveMouse(x, y)
})

ipcMain.handle('is-fullscreen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    return senderWindow.isFullScreen()
})

ipcMain.handle('set-fullscreen', (e, flag) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    senderWindow.setFullScreen(flag)
})

ipcMain.handle('set-minimized', () => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    senderWindow.minimize()
})

ipcMain.handle('close-window', (e) => {
    const windows = BrowserWindow.getAllWindows()
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    if(windows.length === 1){
        writeWindows()
    }
    senderWindow.close()
})