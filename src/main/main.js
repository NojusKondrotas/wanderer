const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const robot = require('@hurdlegroup/robotjs')
const { send, windowsStore } = require('process')

let allNotepads = new Set(), allWhiteboards = new Set()
let largestNotepadID = 0, unusedNotepadIDs = new Array()
let largestWhiteboardID = 0, unusedWhiteboardIDs = new Array()

class WindowHandler{
    static trueWinIDToSymbolicWinIDMapping = new Map()
    static componentToWindowMapping = new Map()
    static trueWinIDToLink = new Map()
    static allWindows = new Map()
    static openWindows = new Map()

    static largestWindowID = 0
    static unusedWindowIDs = new Array()

    static isClosingWindow = false

    static getWindowID(componentID){
        if(this.componentToWindowMapping.has(componentID))
            return this.componentToWindowMapping.get(componentID)

        if(this.unusedWindowIDs.length > 0)
            return this.unusedWindowIDs.pop()
        
        ++this.largestWindowID
        return `window-${this.largestWindowID - 1}`
    }

    static openComponent(componentType, componentID, parentWindowID, fullscreen = false, width = 800, height = 600, x, y){
        if(this.componentToWindowMapping.has(componentID)){
            const winData = this.allWindows.get(this.componentToWindowMapping.get(componentID))
            const win = BrowserWindow.fromId(winData.trueWindowID)
            win.show()
            win.focus()
        }else{
            this.createWindow(componentType, componentID, parentWindowID, fullscreen, width, height, x, y)
        }
    }

    static overwriteWindow(entryFilePath, trueWindowID){
        const win = BrowserWindow.fromId(trueWindowID)
        win.loadFile(entryFilePath)
    }

    static overwriteComponentWindow(entryFilePath, trueWindowID, componentType, componentID){
        const symbolicWinID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWinID)
        this.reinitialiseWindow(trueWindowID, componentType, componentID, winData.parentWindowID)
        this.overwriteWindow(entryFilePath, trueWindowID)
    }

    static createWindow(componentType, componentID, parentWindowID, fullscreen = false, width = 800, height = 600, x, y, url){
        let preloadFilePath = path.join(__dirname, 'preload.js')
        let entryFilePath
        switch(componentType){
            case 'w':
                const saves = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`)
                if(!fs.existsSync(saves))
                    fs.mkdirSync(saves)
                const savedHTML = path.join(saves, `${componentID}-index.html`)
                const defaultHTML = path.join(__dirname, 'whiteboard-index.html')
                if(!fs.existsSync(savedHTML)){
                    entryFilePath = defaultHTML
                }else entryFilePath = savedHTML
                break
            case 'p':
                entryFilePath = path.join(__dirname, 'notepad-index.html')
                break
            case '0':
                entryFilePath = path.join(__dirname, 'prompts', 'first-time', 'prompt-first-time.html')
                break
            case 'l':
                entryFilePath = path.join(__dirname, 'prompts', 'link', 'link.html')
                const linkWin = new BrowserWindow({
                    x,
                    y,
                    width,
                    height,
                    frame: false,
                    titleBarStyle: 'hidden',
                    fullscreen,
                    webPreferences: {
                        preload: path.join(preloadFilePath),
                        contextIsolation: true,
                        nodeIntegration: false,
                        webviewTag: true,
                    }
                })
                linkWin.loadFile(entryFilePath)
                this.trueWinIDToLink.set(linkWin.id, url)

                this.initialiseWindow(linkWin.id, componentType, componentID, parentWindowID)

                return linkWin
        }
        
        const win = new BrowserWindow({
            x,
            y,
            width,
            height,
            frame: false,
            titleBarStyle: 'hidden',
            fullscreen,
            webPreferences: {
                preload: path.join(preloadFilePath),
                contextIsolation: true,
                nodeIntegration: false,
            }
        })
        win.loadFile(entryFilePath)

        this.initialiseWindow(win.id, componentType, componentID, parentWindowID)

        return win
    }

    static closeWindow(trueWindowID){
        console.log('trueWinIDToSymbolicWinIDMapping', this.trueWinIDToSymbolicWinIDMapping, '\n', 'allWindows', this.allWindows, '\n',
            'openWindows', this.openWindows, '\n', 'componentToWindowMapping', this.componentToWindowMapping, '\n')
        if(!this.isClosingWindow) BrowserWindow.fromId(trueWindowID).webContents.send('terminate-window')
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWindowID)
        const componentID = winData.componentID
        this.openWindows.delete(symbolicWindowID)
        this.trueWinIDToSymbolicWinIDMapping.delete(trueWindowID)
        this.allWindows.delete(symbolicWindowID)
        this.componentToWindowMapping.delete(componentID)
        BrowserWindow.fromId(trueWindowID).close()
        this.isClosingWindow = false
    }

    static reinitialiseWindow(trueWindowID, componentType, componentID, parentWindowID){
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWindowID)
        this.componentToWindowMapping.delete(winData.componentID)
        this.allWindows.delete(symbolicWindowID)
        this.openWindows.delete(symbolicWindowID)

        this.initialiseWindow(trueWindowID, componentType, componentID, parentWindowID)
    }

    static initialiseWindow(trueWindowID, componentType, componentID, parentWindowID){
        const symbolicWindowID = this.getWindowID()
        const win = BrowserWindow.fromId(trueWindowID)
        const bounds = win.getBounds()

        this.componentToWindowMapping.set(componentID, symbolicWindowID)

        let x = bounds.x, y = bounds.y
        let wWidth = bounds.width, wHeight = bounds.height
        if(win.isFullScreen()){
            const primaryDisplay = screen.getPrimaryDisplay()
            let { width, height } = primaryDisplay.workAreaSize
            wWidth = 800
            wHeight = 600
            x = Math.round((width - wWidth) / 2)
            y = Math.round((height - wHeight) / 2)
        }

        this.allWindows.set(symbolicWindowID, {
            trueWindowID,
            x,
            y,
            width: wWidth,
            height: wHeight,
            isFullScreen: win.isFullScreen(),
            isMinimized: win.isMinimized(),
            type: componentType,
            componentID,
            parentWindowID
        })

        this.openWindows.set(symbolicWindowID, {symbolicWindowID, type: componentType, componentID})

        this.trueWinIDToSymbolicWinIDMapping.set(trueWindowID, symbolicWindowID)
    }

    static writeComponents(){
        for(let whiteboardID of allWhiteboards){
            const symbolicWinID = this.componentToWindowMapping.get(whiteboardID)
            const winData = this.allWindows.get(symbolicWinID)
            if(!winData) continue
            BrowserWindow.fromId(winData.trueWindowID).webContents.send('save-component')
        }
        for(let notepadID of allNotepads){
            const symbolicWinID = this.componentToWindowMapping.get(notepadID)
            const winData = this.allWindows.get(symbolicWinID)
            if(!winData) continue
            BrowserWindow.fromId(winData.trueWindowID).webContents.send('save-component')
        }
    }

    static writeWindows(){
        const map = new Array()
        this.allWindows.forEach((value, key) => {
            if(value.type !== '0')
                map.push(value)
        })
        const savesPath = path.join(__dirname, '..', 'saves')
        const windowsFilePath = path.join(savesPath, 'windows.json')
        fs.writeFileSync(windowsFilePath, JSON.stringify(map, null, 2), 'utf-8')
        const windowsIDsJSON = path.join(savesPath, 'windows-IDs.json')
        fs.writeFileSync(windowsIDsJSON, JSON.stringify({
            largestNotepadID, largestWhiteboardID, unusedNotepadIDs, unusedWhiteboardIDs,
            allNotepads: Array.from(allNotepads), allWhiteboards: Array.from(allWhiteboards)
        }, null, 2), 'utf-8')
    }
}

function getNotepadID(){
    if(unusedNotepadIDs.length > 0)
        return unusedNotepadIDs.pop()
    else{
        ++largestNotepadID
        return `notepad-${largestNotepadID - 1}`
    }
}

function getWhiteboardID(){
    if(unusedWhiteboardIDs.length > 0)
        return unusedWhiteboardIDs.pop()
    else{
        ++largestWhiteboardID
        return `whiteboard-${largestWhiteboardID - 1}`
    }
}

function terminateApp(){
    WindowHandler.writeComponents()
    WindowHandler.writeWindows()
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
    const windowsIDsJSON = path.join(savesPath, 'windows-IDs.json')
    if(!fs.existsSync(windowsIDsJSON))
        fs.writeFileSync(windowsIDsJSON, JSON.stringify({}, null, 2), 'utf-8')

    const stateWindowsIDs = JSON.parse(fs.readFileSync(windowsIDsJSON, 'utf-8'))
    if(stateWindowsIDs && Object.keys(stateWindowsIDs).length > 0){
        largestNotepadID = stateWindowsIDs.largestNotepadID
        largestWhiteboardID = stateWindowsIDs.largestWhiteboardID
        unusedNotepadIDs = stateWindowsIDs.unusedNotepadIDs
        unusedWhiteboardIDs = stateWindowsIDs.unusedWhiteboardIDs
        allNotepads = new Set(stateWindowsIDs.allNotepads)
        allWhiteboards = new Set(stateWindowsIDs.allWhiteboards)
    }

    const windowsObj = JSON.parse(fs.readFileSync(windowsJSON, 'utf-8'))
    if(Array.isArray(windowsObj) && windowsObj.length > 0){
        for(let i = 0; i < windowsObj.length; ++i){
            const winData = windowsObj[i]
            switch(winData.type){
                case 'p':
                    win = WindowHandler.createWindow('p', winData.componentID, winData.parentWindowID,
                        winData.isFullScreen, winData.width, winData.height, winData.x, winData.y)
                    break
                case 'w':
                    const filePath = path.join(savesWhiteboardsPath, `${winData.componentID}`, `${winData.componentID}-index.html`)
                    win = WindowHandler.createWindow('w', winData.componentID, winData.parentWindowID,
                        winData.isFullScreen, winData.width, winData.height, winData.x, winData.y)
            }
        }
    }else{
        WindowHandler.createWindow('0', null, null, true)
    }
}

app.whenReady().then(() => {
    initialiseApp()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) initialiseApp()
    })

    globalShortcut.register('CmdOrCtrl+1', (e) => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), senderWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+num1', (e) => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('open-titlebar-context-menu', screen.getCursorScreenPoint(), senderWindow.getBounds())
    })
    globalShortcut.register('CmdOrCtrl+2', () => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        const serializedElements = Array.from(WindowHandler.openWindows, ([id, obj]) => (obj))
        if(senderWindow) senderWindow.webContents.send('open-tab-menu', screen.getCursorScreenPoint(), senderWindow.getBounds(), serializedElements)
    })
    globalShortcut.register('CmdOrCtrl+num2', () => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        const serializedElements = Array.from(WindowHandler.openWindows, ([id, obj]) => (obj))
        if(senderWindow) senderWindow.webContents.send('open-tab-menu', screen.getCursorScreenPoint(), senderWindow.getBounds(), serializedElements)
    })
    globalShortcut.register('CmdOrCtrl+X', () => {
        terminateApp()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})

function addNotepad(){
    const id = getNotepadID()
    allNotepads.add(id)
    return id
}

ipcMain.handle('add-notepad', async (e) => {
    return addNotepad()
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const winData = WindowHandler.allWindows.get(notepadID)
    if(winData){
        WindowHandler.openComponent('p', notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isFullScreen, winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent('p', notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
})

function addWhiteboard(){
    const id = getWhiteboardID()
    allWhiteboards.add(id)
    return id
}

ipcMain.handle('add-whiteboard', async (e) => {
    return addWhiteboard()
})

ipcMain.handle('open-whiteboard', (e, whiteboardID) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const winData = WindowHandler.allWindows.get(whiteboardID)
    if(winData){
        WindowHandler.openComponent('w', whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isFullScreen, winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent('w', whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
})

ipcMain.handle('save-quill-delta', (e, contents) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID).componentID
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${componentID}.json`)
    fs.writeFileSync(savesJSON, JSON.stringify(contents, null, 2), 'utf-8')
})

ipcMain.handle('load-quill-delta', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID).componentID
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${componentID}.json`)
    if(!fs.existsSync(savesJSON))
        fs.writeFileSync(savesJSON, JSON.stringify({}, null, 2), 'utf-8')

    const fileContents = fs.readFileSync(savesJSON, 'utf-8')
    const delta = JSON.parse(fileContents)
    return delta
})

ipcMain.handle('first-time-notepad-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    WindowHandler.overwriteComponentWindow(path.join(__dirname, 'notepad-index.html'), senderWindow.id, 'p', addNotepad())
})

ipcMain.handle('first-time-whiteboard-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    WindowHandler.overwriteComponentWindow(path.join(__dirname, 'whiteboard-index.html'), senderWindow.id, 'w', addWhiteboard())
})

ipcMain.handle('get-window-component-id', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    return WindowHandler.allWindows.get(symbolicWinID).componentID
})

ipcMain.on('save-whiteboard-html', (e, html) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicWinID).componentID
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
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicWinID).componentID
    const saveWhiteboardDir = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`)
    if(!fs.existsSync(saveWhiteboardDir)){
        fs.mkdirSync(saveWhiteboardDir)
    }
    
    const dataToSave = {
        largestElementID: stateObj.largestElementID,
        unusedElementIDs: stateObj.unusedElementIDs,
        largestPathID: stateObj.largestPathID,
        unusedPathIDs: stateObj.unusedPathIDs,
        largestQlEditorID: stateObj.largestQlEditorID,
        unusedQlEditorIDs: stateObj.unusedQlEditorIDs,
        elementPositions: stateObj.elementPositions,
        allPaths: stateObj.allPaths,
        allQuillToolbars: stateObj.allQuillToolbars,
        isTitlebarLocked: stateObj.isTitlebarLocked
    }

    const saveWhiteboardState = path.join(saveWhiteboardDir, `${componentID}-state.json`)
    fs.writeFileSync(saveWhiteboardState, JSON.stringify(dataToSave, null, 2), 'utf-8')
})

ipcMain.handle('load-whiteboard-state', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID).componentID
    const saveWhiteboardState = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`,  `${componentID}-state.json`)
    if (fs.existsSync(saveWhiteboardState))
        return JSON.parse(fs.readFileSync(saveWhiteboardState, 'utf-8'))
    return {}
})

ipcMain.handle('set-mouse-position', (e, x, y) => {
    robot.moveMouse(x, y)
})

ipcMain.handle('move-window', (event, bounds) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.setBounds(bounds)
})

ipcMain.handle('is-fullscreen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    return senderWindow.isFullScreen()
})

ipcMain.handle('set-fullscreen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    senderWindow.setFullScreen(!senderWindow.isFullScreen())
    
})

ipcMain.handle('set-maximized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    if(senderWindow.isMaximized()) senderWindow.unmaximize()
    else senderWindow.maximize()
})

ipcMain.handle('set-minimized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    senderWindow.minimize()
})

ipcMain.handle('close-window', (e) => {
    const windows = BrowserWindow.getAllWindows()
    if(windows.length === 1){
        terminateApp()
    }else{
        const senderWindow = BrowserWindow.fromWebContents(e.sender)
        WindowHandler.isClosingWindow = true
        WindowHandler.closeWindow(senderWindow.id)
    }
})

ipcMain.handle('open-link', (e, link) => {
    const win = BrowserWindow.fromWebContents(e.sender)
        //WindowHandler.openComponent('l', link,+--------------------------------------------------poooooooooooooooooooooooooooooooooo WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),

    WindowHandler.createWindow('l', null, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id), false,
        undefined, undefined, undefined, undefined, link)
})

ipcMain.handle('get-link', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    return WindowHandler.trueWinIDToLink.get(win.id)
})

ipcMain.handle('get-window-preview', async (e, symbolicWindowID) => {
    console.log(symbolicWindowID)
    const winData = WindowHandler.allWindows.get(symbolicWindowID)
    const trueWindowID = winData.trueWindowID
    console.log(trueWindowID)
    const image = await BrowserWindow.fromId(trueWindowID).capturePage()
    console.log(image)
    return image.toDataURL()
})