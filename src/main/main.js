import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import robot from '@hurdlegroup/robotjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ComponentType = {
    firstTime: '0',
    whiteboard: 'w',
    notepad: 'p',
    link: 'l',
    configs: 'c',
    tabs: 't'
}

let allNotepads = new Set(), allWhiteboards = new Set()
let largestNotepadID = 0, unusedNotepadIDs = new Array()
let largestWhiteboardID = 0, unusedWhiteboardIDs = new Array()
let largestLinkID = 0, unusedLinkIDs = new Array()

let activeConfigsWindow = null, activeTabMenuWindow = null;

class WindowHandler{
    static trueWinIDToSymbolicWinIDMapping = new Map();
    // support structure for associating true system window IDs with in-app symbolic ones
    // k: trueWindowID
    // v: symbolicWindowID
    static componentToWindowMapping = new Map();
    // support structure for checking whether a component is already open in a separate window
    // k: componentID
    // v: symbolicWindowID
    static allWindows = new Map();
    // primary window structure
    // k :symbolicWindowID
    // v: {
    //         trueWindowID,
    //         x,
    //         y,
    //         width,
    //         height,
    //         isFullScreen: win.isFullScreen(),
    //         isMinimized: win.isMinimized(),
    //         isMaximized: win.isMaximized(),
    //         componentType,
    //         componentID,
    //         parentWindowID,
    //         url
    //    }
    static openWindows = new Map();
    // copies the relevant entries of allWindows
    // k: symbolicWindowID
    // v: allWindows.get(symbolicWindowID)

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

    static getWindowDimensions(win){
        const bounds = win.getBounds();
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

        return { x, y, width: wWidth, height: wHeight }
    }

    static focusWindow(win){
        win.show();
        win.focus();
    }

    static openComponent(componentType, componentID, parentWindowID, minimized = false, maximized = false, fullscreen = false, width = 800, height = 600, x, y){
        if(this.componentToWindowMapping.has(componentID)){
            const symbolID = this.componentToWindowMapping.get(componentID);
            const winData = this.allWindows.get(this.componentToWindowMapping.get(componentID));
            if(this.openWindows.has(symbolID)){
                const win = BrowserWindow.fromId(winData.trueWindowID);
                this.focusWindow(win);
            } else {
                const win = this.createWindow(winData.componentType, componentID, winData.isMinimized, winData.isMaximized, winData.isFullScreen, winData.width, winData.height, winData.x, winData.y);
                this.initialiseWindow(win.id, winData.componentType, componentID, parentWindowID);
            }
        }else{
            const win = this.createWindow(componentType, componentID, minimized, maximized, fullscreen, width, height, x, y);
            this.initialiseWindow(win.id, componentType, componentID, parentWindowID);
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

    static createWindow(componentType, componentID, minimized = false, maximized = false, fullscreen = false, width = 800, height = 600, x, y){
        let preloadFilePath = path.join(__dirname, 'preload.js')
        let entryFilePath
        switch(componentType){
            case ComponentType.whiteboard:
                const saves = path.join(__dirname, '..', 'saves', 'whiteboards', `${componentID}`)
                if(!fs.existsSync(saves))
                    fs.mkdirSync(saves)
                const savedHTML = path.join(saves, `${componentID}-index.html`)
                const defaultHTML = path.join(__dirname, 'whiteboard-index.html')
                if(!fs.existsSync(savedHTML)){
                    entryFilePath = defaultHTML
                }else entryFilePath = savedHTML
                break
            case ComponentType.notepad:
                entryFilePath = path.join(__dirname, 'notepad-index.html')
                break
            case ComponentType.firstTime:
                entryFilePath = path.join(__dirname, 'prompts', 'first-time', 'prompt-first-time.html')
                break
            case ComponentType.link:
                entryFilePath = path.join(__dirname, 'prompts', 'link', 'prompt-link.html')
            case ComponentType.configs:
                entryFilePath = path.join(__dirname, 'prompts', 'configs', 'configs.html')
        }
        
        let win;
        if(componentType === ComponentType.link){
            win = new BrowserWindow({
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
                    webviewTag: true
                },
                show: false,
            })
        }else{
            win = new BrowserWindow({
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
                },
                show: false,
            })
        }
        win.loadFile(entryFilePath).then(() => {
            if(!fullscreen){
                if(maximized) win.maximize()
                if(minimized) win.minimize()
            }

            if (!minimized) win.show()
        })

        if(this.componentToWindowMapping.has(componentID)){
            this.trueWinIDToSymbolicWinIDMapping.set(win.id, this.componentToWindowMapping.get(componentID));
        }else{
            this.trueWinIDToSymbolicWinIDMapping.set(win.id, this.getWindowID());
        }

        win.on('restore', () => {
            let symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(win.id)
            this.allWindows.get(symbolicWindowID).isMinimized = false
        })

        return win;
    }

    static closeWindow(trueWindowID){
        // console.log('trueWinIDToSymbolicWinIDMapping', this.trueWinIDToSymbolicWinIDMapping, '\n', 'allWindows', this.allWindows, '\n',
        //     'openWindows', this.openWindows, '\n', 'componentToWindowMapping', this.componentToWindowMapping, '\n')
        const win = BrowserWindow.fromId(trueWindowID);
        if(!this.isClosingWindow)
            win.webContents.send('terminate-window');
        win.webContents.send('save-component');
    }

    static finishCloseWindow(trueWindowID){
        const win = BrowserWindow.fromId(trueWindowID);
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID);
        const winData = this.allWindows.get(symbolicWindowID);
        this.saveWindowFeatures(symbolicWindowID, trueWindowID, winData.componentType, winData.componentID, winData.parentWindowID, winData.url, win);
        this.openWindows.delete(symbolicWindowID);
        if(winData.componentType === ComponentType.configs) {
            this.allWindows.delete(symbolicWindowID);
            this.trueWinIDToSymbolicWinIDMapping.delete(win.id);
            activeConfigsWindow = null;
        }
        win.close();
        this.isClosingWindow = false;
    }

    static closeAllWindows(){
        const values = this.openWindows.values();
        for(const v of values){
            this.closeWindow(v.trueWindowID);
        }
    }

    static reinitialiseWindow(trueWindowID, componentType, componentID, parentWindowID){
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWindowID)
        this.componentToWindowMapping.delete(winData.componentID)
        this.allWindows.delete(symbolicWindowID)
        this.openWindows.delete(symbolicWindowID)

        this.initialiseWindow(trueWindowID, componentType, componentID, parentWindowID)
    }

    static saveWindowFeatures(symbolicWindowID, trueWindowID, componentType, componentID, parentWindowID, url = null, window){
        let { x, y, width, height } = this.getWindowDimensions(window);

        this.allWindows.set(symbolicWindowID, {
            trueWindowID,
            x,
            y,
            width,
            height,
            isFullScreen: window.isFullScreen(),
            isMinimized: window.isMinimized(),
            isMaximized: window.isMaximized(),
            componentType,
            componentID,
            parentWindowID,
            url
        });
    }

    static initialiseWindow(trueWindowID, componentType, componentID, parentWindowID, url = null){
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID);
        if(componentID != null) {
            if(!this.componentToWindowMapping.has(componentID)){
                this.componentToWindowMapping.set(componentID, symbolicWindowID)
            }
        }

        this.saveWindowFeatures(symbolicWindowID, trueWindowID, componentType, componentID, parentWindowID, url, BrowserWindow.fromId(trueWindowID));

        this.openWindows.set(symbolicWindowID, this.allWindows.get(symbolicWindowID));
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
        const openWindowsMap = new Array();
        this.openWindows.forEach((value, key) => {
            if(value.componentType !== ComponentType.firstTime && value.componentType !== ComponentType.configs){
                const win = BrowserWindow.fromId(value.trueWindowID);
                WindowHandler.saveWindowFeatures(key, value.trueWindowID, value.componentType, value.componentID, value.parentWindowID, value.url, win);
                openWindowsMap.push(value);
            }
        });
        const allWindowsMap = new Array();
        this.allWindows.forEach((value, key) => {
            if(value.componentType !== ComponentType.firstTime && value.componentType !== ComponentType.configs){
                allWindowsMap.push(value);
            }
        });
        const savesPath = path.join(__dirname, '..', 'saves');
        const openWindowsFilePath = path.join(savesPath, 'open-windows.json');
        fs.writeFileSync(openWindowsFilePath, JSON.stringify(openWindowsMap, null, 2), 'utf-8');
        const allWindowsFilePath = path.join(savesPath, 'all-windows.json');
        fs.writeFileSync(allWindowsFilePath, JSON.stringify(allWindowsMap, null, 2), 'utf-8');
        const windowsIDsJSON = path.join(savesPath, 'windows-IDs.json');
        fs.writeFileSync(windowsIDsJSON, JSON.stringify({
            largestNotepadID, largestWhiteboardID, unusedNotepadIDs, unusedWhiteboardIDs,
            allNotepads: Array.from(allNotepads), allWhiteboards: Array.from(allWhiteboards)
        }, null, 2), 'utf-8');
    }
}

ipcMain.on('save-component-done', async (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender);
    WindowHandler.finishCloseWindow(senderWindow.id);
});

function getMousePos(senderWindow){
    const mousePos = screen.getCursorScreenPoint()
    const bounds = senderWindow.getBounds()

    return {
        x: mousePos.x - bounds.x,
        y: mousePos.y - bounds.y
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

function getLinkID(){
    if(unusedLinkIDs.length > 0)
        return unusedLinkIDs.pop()
    else{
        ++largestLinkID
        return `link-${largestLinkID - 1}`
    }
}

function terminateApp(){
    // console.log('writecompoennts')
    // WindowHandler.writeComponents()
    console.log('writewindows')
    WindowHandler.writeWindows()
    console.log('closeallwindow')
    WindowHandler.closeAllWindows()
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

    const openWindowsJSON = path.join(savesPath, 'open-windows.json')
    if(!fs.existsSync(openWindowsJSON))
        fs.writeFileSync(openWindowsJSON, JSON.stringify([], null, 2), 'utf-8')
    const allWindowsJSON = path.join(savesPath, 'all-windows.json')
    if(!fs.existsSync(allWindowsJSON))
        fs.writeFileSync(allWindowsJSON, JSON.stringify([], null, 2), 'utf-8')
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
    const allWindowObj = JSON.parse(fs.readFileSync(allWindowsJSON, 'utf-8'));
    if(Array.isArray(allWindowObj) && allWindowObj.length > 0){
        allWindowObj.forEach(winData => {
            const id = WindowHandler.getWindowID();
            WindowHandler.allWindows.set(id, winData);
            if(winData.componentID != null) {
                WindowHandler.componentToWindowMapping.set(winData.componentID, id);
            }
        });
    }
    const openWindowsObj = JSON.parse(fs.readFileSync(openWindowsJSON, 'utf-8'))
    if(Array.isArray(openWindowsObj) && openWindowsObj.length > 0){
        openWindowsObj.forEach(winData => {
            let win = null;
            switch(winData.componentType){
                case ComponentType.whiteboard:
                    win = WindowHandler.createWindow(ComponentType.whiteboard, winData.componentID,
                        winData.isMinimized, winData.isMaximized, winData.isFullScreen,
                        winData.width, winData.height, winData.x, winData.y);
                    WindowHandler.initialiseWindow(win.id, ComponentType.whiteboard, winData.componentID, winData.parentWindowID);
                    break;
                case ComponentType.notepad:
                    win = WindowHandler.createWindow(ComponentType.notepad, winData.componentID,
                        winData.isMinimized, winData.isMaximized, winData.isFullScreen,
                        winData.width, winData.height, winData.x, winData.y);
                    WindowHandler.initialiseWindow(win.id, ComponentType.notepad, winData.componentID, winData.parentWindowID);
                    break;
                case ComponentType.link:
                    win = WindowHandler.createWindow(ComponentType.link, winData.componentID,
                        winData.isMinimized, winData.isMaximized, winData.isFullScreen,
                        winData.width, winData.height, winData.x, winData.y);
                    WindowHandler.initialiseWindow(win.id, ComponentType.link, winData.componentID, winData.parentWindowID, winData.url);
                    break;
            }
        });
    }else{
        const win = WindowHandler.createWindow(ComponentType.firstTime, null, false, false, true);
        WindowHandler.initialiseWindow(win.id, ComponentType.firstTime, null, null);
    }
}

ipcMain.handle('get-window-center', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(!win) {
        return null;
    }

    const { x, y, width, height } = win.getBounds();
    return {
        x: x + width / 2,
        y: y + height / 2
    };
});

ipcMain.handle('open-configs', () => {
    if(activeConfigsWindow != null) {
        return WindowHandler.focusWindow(activeConfigsWindow);
    }

    activeConfigsWindow = WindowHandler.createWindow(ComponentType.configs, null, false, false, true);
    WindowHandler.initialiseWindow(activeConfigsWindow.id, ComponentType.configs, null, null);
})

ipcMain.handle('close-tab-menu-done', () => {
    activeTabMenuWindow = null;
})

async function waitForTabMenuClose() {
    if(activeTabMenuWindow == null) return;

    activeTabMenuWindow.webContents.send('close-tab-menu');
    await new Promise(resolve => {
        ipcMain.once('close-tab-menu-done', resolve);
    });

    activeTabMenuWindow = null;
}

async function getWindowPreview(symbolicWindowID){
    const winData = WindowHandler.allWindows.get(symbolicWindowID)
    const win = BrowserWindow.fromId(winData.trueWindowID);

    const image = await win.capturePage()
    return image.toDataURL()
}

app.whenReady().then(() => {
    initialiseApp()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) initialiseApp()
    })

    globalShortcut.register('CmdOrCtrl+1', (e) => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('open-titlebar-context-menu', getMousePos(senderWindow))
    })
    globalShortcut.register('CmdOrCtrl+num1', (e) => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('open-titlebar-context-menu', getMousePos(senderWindow))
    })
    globalShortcut.register('CmdOrCtrl+2', async () => {
        const senderWindow = BrowserWindow.getFocusedWindow();
        const serializedElements = Array();
        WindowHandler.openWindows.forEach((value, key) => {
            const data = {
                symbolicWindowID: key,
                componentType: value.componentType,
                componentID: value.componentID
            };
            serializedElements.push(data);
        });
        await waitForTabMenuClose();
        const previews = [];
        for (const el of serializedElements) {
            previews.push(await getWindowPreview(el.symbolicWindowID));
        }
        if(!senderWindow) {
            // handle
            return;
        }
        activeTabMenuWindow = senderWindow;
        senderWindow.webContents.send('open-tab-menu', getMousePos(senderWindow), serializedElements, previews);
    })
    globalShortcut.register('CmdOrCtrl+num2', async () => {
        const senderWindow = BrowserWindow.getFocusedWindow();
        const serializedElements = Array();
        WindowHandler.openWindows.forEach((value, key) => {
            const data = {
                symbolicWindowID: value.symbolicWindowID,
                componentType: value.componentType,
                componentID: value.componentID
            };
            serializedElements.push(data);
        });
        await waitForTabMenuClose();
        const previews = [];
        for (const el of serializedElements) {
            previews.push(await getWindowPreview(el.symbolicWindowID));
        }
        if(!senderWindow) {
            // handle
            return;
        }
        activeTabMenuWindow = senderWindow;
        senderWindow.webContents.send('open-tab-menu', getMousePos(senderWindow), serializedElements, previews);
    })
    globalShortcut.register('CmdOrCtrl+X', () => {
        terminateApp()
    })
    globalShortcut.register('CmdOrCtrl+numadd', () => {
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('zoom-in-window', getMousePos(senderWindow))
    })
    globalShortcut.register('CmdOrCtrl+numsub', () => {
        
        const senderWindow = BrowserWindow.getFocusedWindow()
        if(senderWindow) senderWindow.webContents.send('zoom-out-window', getMousePos(senderWindow))
    })
})

ipcMain.on('log-message', (_, message) => console.log(message));

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
        WindowHandler.openComponent(ComponentType.notepad, notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isMinimized, winData.isMaximized, winData.isFullScreen,
            winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent(ComponentType.notepad, notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
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
        WindowHandler.openComponent(ComponentType.whiteboard, whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isMinimized, winData.isMaximized, winData.isFullScreen,
            winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent(ComponentType.whiteboard, whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
})

ipcMain.handle('open-link', (e, link) => {
    const win = BrowserWindow.fromWebContents(e.sender)
        //WindowHandler.openComponent('l', link,+--------------------------------------------------poooooooooooooooooooooooooooooooooo WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),

    WindowHandler.createWindow(ComponentType.link, null, false, false, false,
        undefined, undefined, undefined, undefined, link);
    WindowHandler.initialiseWindow(win.id, ComponentType.link, getLinkID(), WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id), link);
})

ipcMain.handle('get-link', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id);
    return WindowHandler.allWindows.get(symbolicWinID).url;
})

ipcMain.handle('save-editor-contents', (e, contents) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID).componentID
    const savesJSON = path.join(__dirname, '..', 'saves', 'notepads', `${componentID}.json`)
    fs.writeFileSync(savesJSON, JSON.stringify(contents, null, 2), 'utf-8')
})

ipcMain.handle('load-editor-contents', (e) => {
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
    WindowHandler.overwriteComponentWindow(path.join(__dirname, 'notepad-index.html'), senderWindow.id, ComponentType.notepad, addNotepad())
})

ipcMain.handle('first-time-whiteboard-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    WindowHandler.overwriteComponentWindow(path.join(__dirname, 'whiteboard-index.html'), senderWindow.id, ComponentType.whiteboard, addWhiteboard())
})

ipcMain.handle('get-window-component-id', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    return WindowHandler.allWindows.get(symbolicWinID).componentID
})

ipcMain.on('save-whiteboard-html', (e, html) => {
    console.log('saving html in main')
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    console.log('save html wb: ' + symbolicWinID)
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
    console.log('saving state in main')
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    console.log('save json wb: ' + symbolicWinID)
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
        largestNoteContainerID: stateObj.largestNoteContainerID,
        unusedNoteContainerIDs: stateObj.unusedNoteContainerIDs,
        elementPositions: stateObj.elementPositions,
        elementHierarchy: stateObj.elementHierarchy,
        allPaths: stateObj.allPaths,
        allNotesContents: stateObj.allNotesContents,
        isTitlebarLocked: stateObj.isTitlebarLocked,
        zoomFactor: stateObj.zoomFactor,
        boardOffset: stateObj.boardOffset
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
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID).isFullScreen = !senderWindow.isFullScreen()
    senderWindow.setFullScreen(!senderWindow.isFullScreen())
    
})

ipcMain.handle('set-maximized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID).isMaximized = !senderWindow.isMaximized()
    if(senderWindow.isMaximized()) senderWindow.unmaximize()
    else senderWindow.maximize()
})

ipcMain.handle('set-minimized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID).isMinimized = true
    senderWindow.minimize()
})

ipcMain.handle('remove-from-windows', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender);
    WindowHandler.removeFromWindows(senderWindow.id);
})

ipcMain.handle('close-window', async (e) => {
    const windows = BrowserWindow.getAllWindows();
    if(windows.length === 1){
        terminateApp();
    }else{
        const senderWindow = BrowserWindow.fromWebContents(e.sender);
        WindowHandler.isClosingWindow = true;
        WindowHandler.closeWindow(senderWindow.id);
    }
});