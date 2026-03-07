import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { access, constants, stat, readFile, writeFile, mkdir } from 'fs/promises'
import robot from '@hurdlegroup/robotjs'
import { WBSave } from './types/wb-state.js'
import { Vector2D } from '../runtime/numerics.js'
import { createOpenWindow, OpenWindow } from './types/open-window.js'
import { WandererWindow } from './types/wanderer-window.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const preloadFilePath = path.join(__dirname, 'preload.js');

const savesPath = path.join(__dirname, '..', '..', 'saves');

const defaultWhiteboardHTML = path.join(savesPath, 'defaults', 'whiteboard-index.html');
const defaultNotepadHTML = path.join(savesPath, 'defaults', 'notepad-index.html');
const defaultPromptsPath = path.join(savesPath, 'defaults', 'prompts');
const defaultPromptsConfigsHTML = path.join(defaultPromptsPath, 'configs', 'configs.html');
const defaultPromptsFirstTimeHTML = path.join(defaultPromptsPath, 'first-time', 'prompt-first-time.html');
const defaultPromptsLinkHTML = path.join(defaultPromptsPath, 'link', 'prompt-link.html');

const saved = Object.freeze({
    all: savesPath,
    whiteboardsPath: path.join(savesPath, 'whiteboards'),
    notepadsPath: path.join(savesPath, 'notepads'),
    allWindowsPath: path.join(savesPath, 'all-windows.json'),
    openWindowsPath: path.join(savesPath, 'open-windows.json'),
    windowsIDsPath: path.join(savesPath, 'windows-IDs.json'),
});

export enum WindowTypes {
    firstTime ='0',
    whiteboard = 'w',
    notepad = 'p',
    link = 'l',
    configs = 'c',
    tabs = 't'
}

let allNotepads = new Set(), allWhiteboards = new Set()
let largestNotepadID = 0, unusedNotepadIDs = new Array()
let largestWhiteboardID = 0, unusedWhiteboardIDs = new Array()
let largestLinkID = 0, unusedLinkIDs = new Array()

let activeConfigsWindow: BrowserWindow | null = null, activeTabMenuWindow: BrowserWindow | null = null;

async function fileExists(path) {
    try {
        const stats = await stat(path);

        if (stats.isFile()) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return false;
        } else {
            throw err;
        }
    }
}

async function directoryExists(path) {
    try {
        const stats = await stat(path);

        if (stats.isDirectory()) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return false;
        } else {
            throw err;
        }
    }
}

class WindowHandler{
    static trueWinIDToSymbolicWinIDMapping = new Map();
    // support structure for associating true system window IDs with in-app symbolic ones
    // k: trueWindowID
    // v: symbolicWindowID
    static componentToWindowMapping = new Map();
    // support structure for checking whether a component is already open in a separate window
    // k: componentID
    // v: symbolicWindowID
    static allWindows = new Map<string, WandererWindow>();
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
    //         windowType,
    //         componentID,
    //         parentWindowID,
    //         url
    //    }
    static openWindows = new Map<string, OpenWindow>();
    // reduced relevant entries of allWindows
    // k: symbolicWindowID
    // v: {
    //         symbolicWindowID: key,
    //         windowType: value.windowType,
    //         componentID: value.componentID
    //    }

    static largestWindowID = 0
    static unusedWindowIDs = new Array()

    static isClosingWindow = false

    static removeFromWindows(id: number) {
        throw new Error("Remove from windows: missing implementation")
    }

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

    static async openComponent(windowType, componentID, parentWindowID, minimized = false, maximized = false, fullscreen = false, width = 800, height = 600, x?: number, y?: number){
        if(this.componentToWindowMapping.has(componentID)){
            const symbolID = this.componentToWindowMapping.get(componentID);
            const winData = this.allWindows.get(this.componentToWindowMapping.get(componentID))!;
            if(this.openWindows.has(symbolID)){
                const win = BrowserWindow.fromId(winData.trueWindowID);
                this.focusWindow(win);
            } else {
                const win = await this.createWindow(winData.windowType, componentID, winData.isMinimized, winData.isMaximized, winData.isFullScreen, winData.width, winData.height, winData.x, winData.y);
                this.initialiseWindow(win.id, winData.windowType, componentID, parentWindowID);
            }
        }else{
            const win = await this.createWindow(windowType, componentID, minimized, maximized, fullscreen, width, height, x, y);
            this.initialiseWindow(win.id, windowType, componentID, parentWindowID);
        }
    }

    static overwriteWindow(entryFilePath, trueWindowID){
        const win = BrowserWindow.fromId(trueWindowID)!
        win.loadFile(entryFilePath)
    }

    static overwriteComponentWindow(entryFilePath, trueWindowID, windowType, componentID){
        const symbolicWinID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWinID)!
        this.reinitialiseWindow(trueWindowID, windowType, componentID, winData.parentWindowID)
        this.overwriteWindow(entryFilePath, trueWindowID)
    }

    static async createWindow(windowType: WindowTypes, componentID, minimized = false, maximized = false, fullscreen = false, width = 800, height = 600, x?: number, y?: number, link?: string){
        let entryFilePath
        switch(windowType){
            case WindowTypes.whiteboard:
                const save = path.join(saved.whiteboardsPath, `${componentID}`)
                await mkdir(save, { recursive: true });
                const savedHTML = path.join(save, `${componentID}-index.html`)
                if(!(await fileExists(savedHTML))){
                    entryFilePath = defaultWhiteboardHTML;
                }else entryFilePath = savedHTML;
                break
            case WindowTypes.notepad:
                entryFilePath = defaultNotepadHTML
                break
            case WindowTypes.firstTime:
                entryFilePath = defaultPromptsFirstTimeHTML
                break
            case WindowTypes.link:
                entryFilePath = defaultPromptsLinkHTML
                break
            case WindowTypes.configs:
                entryFilePath = defaultPromptsConfigsHTML
        }
        
        let win;
        if(windowType === WindowTypes.link){
            win = new BrowserWindow({
                x,
                y,
                width,
                height,
                frame: false,
                titleBarStyle: 'hidden',
                fullscreen,
                webPreferences: {
                    preload: preloadFilePath,
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
                    preload: preloadFilePath,
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
            this.trueWinIDToSymbolicWinIDMapping.set(win.id, this.getWindowID(null));
        }

        win.on('restore', () => {
            let symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(win.id)
            this.allWindows.get(symbolicWindowID)!.isMinimized = false
        })

        return win;
    }

    static closeWindow(trueWindowID){
        // console.log('trueWinIDToSymbolicWinIDMapping', this.trueWinIDToSymbolicWinIDMapping, '\n', 'allWindows', this.allWindows, '\n',
        //     'openWindows', this.openWindows, '\n', 'componentToWindowMapping', this.componentToWindowMapping, '\n')
        const win = BrowserWindow.fromId(trueWindowID)!;
        if(!this.isClosingWindow)
            win.webContents.send('terminate-window');
        win.webContents.send('save-component');
    }

    static finishCloseWindow(trueWindowID){
        const win = BrowserWindow.fromId(trueWindowID)!;
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID);
        const winData = this.allWindows.get(symbolicWindowID)!;
        this.saveWindowFeatures(symbolicWindowID, trueWindowID, winData.windowType, winData.componentID, winData.parentWindowID, winData.url, win);
        this.openWindows.delete(symbolicWindowID);
        if(winData.windowType === WindowTypes.configs) {
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
            this.closeWindow(this.allWindows.get(v.symbolicWindowID)?.trueWindowID);
        }
    }

    static reinitialiseWindow(trueWindowID, windowType, componentID, parentWindowID){
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID)
        const winData = this.allWindows.get(symbolicWindowID)!
        this.componentToWindowMapping.delete(winData.componentID)
        this.allWindows.delete(symbolicWindowID)
        this.openWindows.delete(symbolicWindowID)

        this.initialiseWindow(trueWindowID, windowType, componentID, parentWindowID)
    }

    static saveWindowFeatures(symbolicWindowID, trueWindowID, windowType: WindowTypes, componentID, parentWindowID, url: string | null = null, window: BrowserWindow){
        let { x, y, width, height } = this.getWindowDimensions(window);

        this.allWindows.set(symbolicWindowID, {
            symbolicWindowID,
            trueWindowID,
            x,
            y,
            width,
            height,
            isFullScreen: window.isFullScreen(),
            isMinimized: window.isMinimized(),
            isMaximized: window.isMaximized(),
            windowType,
            componentID,
            parentWindowID,
            url
        });
    }

    static initialiseWindow(trueWindowID, windowType, componentID, parentWindowID, url = null){
        const symbolicWindowID = this.trueWinIDToSymbolicWinIDMapping.get(trueWindowID);
        if(componentID != null) {
            if(!this.componentToWindowMapping.has(componentID)){
                this.componentToWindowMapping.set(componentID, symbolicWindowID)
            }
        }

        this.saveWindowFeatures(symbolicWindowID, trueWindowID, windowType, componentID, parentWindowID, url, BrowserWindow.fromId(trueWindowID)!);

        this.openWindows.set(symbolicWindowID, createOpenWindow(symbolicWindowID, this.allWindows.get(symbolicWindowID)!));
    }

    static writeComponents(){
        for(let whiteboardID of allWhiteboards){
            const symbolicWinID = this.componentToWindowMapping.get(whiteboardID)
            const winData = this.allWindows.get(symbolicWinID)
            if(!winData) continue
            BrowserWindow.fromId(winData.trueWindowID)!.webContents.send('save-component')
        }
        for(let notepadID of allNotepads){
            const symbolicWinID = this.componentToWindowMapping.get(notepadID)
            const winData = this.allWindows.get(symbolicWinID)
            if(!winData) continue
            BrowserWindow.fromId(winData.trueWindowID)!.webContents.send('save-component')
        }
    }

    static async writeWindows(){
        const openWindowsMap = new Array();
        this.openWindows.forEach((value, key) => {
            if(value.windowType !== WindowTypes.firstTime && value.windowType !== WindowTypes.configs){
                const allWindowsEntry = this.allWindows.get(value.symbolicWindowID)!;
                const win = BrowserWindow.fromId(allWindowsEntry.trueWindowID)!;
                WindowHandler.saveWindowFeatures(key, allWindowsEntry.trueWindowID, value.windowType, value.componentID, allWindowsEntry.parentWindowID, allWindowsEntry.url, win);
                openWindowsMap.push(value);
            }
        });
        const allWindowsMap = new Array();
        this.allWindows.forEach((value, key) => {
            if(value.windowType !== WindowTypes.firstTime && value.windowType !== WindowTypes.configs){
                allWindowsMap.push(value);
            }
        });

        await Promise.all([
            writeFile(saved.openWindowsPath, JSON.stringify(openWindowsMap, null, 2), 'utf-8'),
            writeFile(saved.allWindowsPath, JSON.stringify(allWindowsMap, null, 2), 'utf-8'),
            writeFile(saved.windowsIDsPath, JSON.stringify({
                largestNotepadID, largestWhiteboardID, unusedNotepadIDs, unusedWhiteboardIDs,
                allNotepads: Array.from(allNotepads), allWhiteboards: Array.from(allWhiteboards)
            }, null, 2), 'utf-8')
        ]);
    }
}

ipcMain.on('save-component-done', async (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!;
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

async function terminateApp(){
    // console.log('writecompoennts')
    // WindowHandler.writeComponents()
    console.log('writewindows')
    await WindowHandler.writeWindows()
    console.log('closeallwindow')
    WindowHandler.closeAllWindows()
}

async function initialiseApp(){
    const results = await Promise.all([
        mkdir(savesPath, { recursive: true }),
        mkdir(saved.notepadsPath, { recursive: true }),
        mkdir(saved.whiteboardsPath, { recursive: true }),
        fileExists(defaultWhiteboardHTML),
        fileExists(defaultNotepadHTML),
        fileExists(preloadFilePath)
    ]);

    if (!results[3])
        process.exit
    if (!results[4])
        process.exit
    if (!results[5])
        process.exit

    await Promise.all([
        (async function() {
            if (!await fileExists(saved.openWindowsPath))
                await writeFile(saved.openWindowsPath, JSON.stringify([], null, 2), 'utf-8')
        })(),
        (async function() {
            if (!await fileExists(saved.allWindowsPath))
                await writeFile(saved.allWindowsPath, JSON.stringify([], null, 2), 'utf-8')
        })(),
        (async function() {
            if (!await fileExists(saved.windowsIDsPath))
                await writeFile(saved.windowsIDsPath, JSON.stringify({}, null, 2), 'utf-8')
        })()
    ]);

    const stateWindowsIDs = JSON.parse(await readFile(saved.windowsIDsPath, 'utf-8'))
    if(stateWindowsIDs && Object.keys(stateWindowsIDs).length > 0){
        largestNotepadID = stateWindowsIDs.largestNotepadID
        largestWhiteboardID = stateWindowsIDs.largestWhiteboardID
        unusedNotepadIDs = stateWindowsIDs.unusedNotepadIDs
        unusedWhiteboardIDs = stateWindowsIDs.unusedWhiteboardIDs
        allNotepads = new Set(stateWindowsIDs.allNotepads)
        allWhiteboards = new Set(stateWindowsIDs.allWhiteboards)
    }
    const allWindowObj = JSON.parse(await readFile(saved.allWindowsPath, 'utf-8'));
    if(Array.isArray(allWindowObj) && allWindowObj.length > 0){
        allWindowObj.forEach(winData => {
            WindowHandler.allWindows.set(winData.symbolicWindowID, winData);
            if(winData.componentID != null) {
                WindowHandler.componentToWindowMapping.set(winData.componentID, winData.symbolicWindowID);
            }
        });
    }
    const openWindowsObj = JSON.parse(await readFile(saved.openWindowsPath, 'utf-8'))
    console.log(openWindowsObj);
    if(Array.isArray(openWindowsObj) && openWindowsObj.length > 0){
        const windowPromises = openWindowsObj.map(async (winData) => {
            const allWinData = WindowHandler.allWindows.get(winData.symbolicWindowID);

            if(!allWinData) {
                throw new Error("winData not found, unnable to proceed");
            }

            let win: BrowserWindow | null = null;
            switch(winData.windowType){
                case WindowTypes.whiteboard:
                    win = await WindowHandler.createWindow(WindowTypes.whiteboard, allWinData.componentID,
                        allWinData.isMinimized, allWinData.isMaximized, allWinData.isFullScreen,
                        allWinData.width, allWinData.height, allWinData.x, allWinData.y);
                    break;
                case WindowTypes.notepad:
                    win = await WindowHandler.createWindow(WindowTypes.notepad, allWinData.componentID,
                        allWinData.isMinimized, allWinData.isMaximized, allWinData.isFullScreen,
                        allWinData.width, allWinData.height, allWinData.x, allWinData.y);
                    break;
                case WindowTypes.link:
                    win = await WindowHandler.createWindow(WindowTypes.link, allWinData.componentID,
                        allWinData.isMinimized, allWinData.isMaximized, allWinData.isFullScreen,
                        allWinData.width, allWinData.height, allWinData.x, allWinData.y);
                    break;
            }

            if(win) {
                WindowHandler.initialiseWindow(win.id, allWinData.windowType, allWinData.componentID, allWinData.parentWindowID);
            }
        });

        await Promise.all(windowPromises);
    }else{
        const win = await WindowHandler.createWindow(WindowTypes.firstTime, null, false, false, true);
        WindowHandler.initialiseWindow(win.id, WindowTypes.firstTime, null, null);
    }
}

ipcMain.handle('get-window-center', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if(!win) {
        return null;
    }

    const { x, y, width, height } = win.getBounds();
    return new Vector2D(
        x + width / 2,
        y + height / 2
    );
});

ipcMain.handle('open-configs', async () => {
    if(activeConfigsWindow != null) {
        return WindowHandler.focusWindow(activeConfigsWindow);
    }

    activeConfigsWindow = await WindowHandler.createWindow(WindowTypes.configs, null, false, false, true);
    WindowHandler.initialiseWindow(activeConfigsWindow!.id, WindowTypes.configs, null, null);
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

async function getWindowPreview(symbolicWindowID): Promise<string> {
    const winData = WindowHandler.allWindows.get(symbolicWindowID)!
    const win = BrowserWindow.fromId(winData.trueWindowID)!;

    const image = await win.capturePage()
    return image.toDataURL()
}

app.whenReady().then(() => {
    initialiseApp()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) initialiseApp()
    })

    function glblShrtct_openTitlebarCM() {
        const senderWindow = BrowserWindow.getFocusedWindow();
        if(senderWindow) senderWindow.webContents.send('open-titlebar-context-menu', getMousePos(senderWindow));
    }
    async function glblShrtct_openTabMenu() {
        const senderWindow = BrowserWindow.getFocusedWindow();
        const serializedElements = Array<OpenWindow>();
        WindowHandler.openWindows.forEach((value, key) => {
            const data = {
                symbolicWindowID: key,
                windowType: value.windowType,
                componentID: value.componentID
            } satisfies OpenWindow;
            serializedElements.push(data);
        });
        await waitForTabMenuClose();
        const previews: any[] = [];
        for (const el of serializedElements) {
            previews.push(await getWindowPreview(el.symbolicWindowID));
        }
        if(!senderWindow) {
            // handle
            return;
        }
        activeTabMenuWindow = senderWindow;
        senderWindow.webContents.send('open-tab-menu', getMousePos(senderWindow), serializedElements, previews);
    }

    globalShortcut.register('CmdOrCtrl+1', glblShrtct_openTitlebarCM);
    globalShortcut.register('CmdOrCtrl+num1', glblShrtct_openTitlebarCM);
    globalShortcut.register('CmdOrCtrl+2', glblShrtct_openTabMenu);
    globalShortcut.register('CmdOrCtrl+num2', glblShrtct_openTabMenu);
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

function deleteNotepad(id) {
    allNotepads.delete(id);
    unusedNotepadIDs.push(id);
}

ipcMain.on('delete-notepad', (e, notepadID) => {
    deleteNotepad(notepadID);
})

ipcMain.handle('open-notepad', (e, notepadID) => {
    const win = BrowserWindow.fromWebContents(e.sender)!
    const winData = WindowHandler.allWindows.get(notepadID)
    if(winData){
        WindowHandler.openComponent(WindowTypes.notepad, notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isMinimized, winData.isMaximized, winData.isFullScreen,
            winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent(WindowTypes.notepad, notepadID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
})

function addWhiteboard(){
    const id = getWhiteboardID()
    allWhiteboards.add(id)
    return id
}

ipcMain.handle('add-whiteboard', async (e) => {
    return addWhiteboard()
})

function deleteWhiteboard(id) {
    allWhiteboards.delete(id);
    unusedWhiteboardIDs.push(id);
}

ipcMain.on('delete-whiteboard', (e, whiteboardID) => {
    deleteWhiteboard(whiteboardID);
})

ipcMain.handle('open-whiteboard', (e, whiteboardID) => {
    const win = BrowserWindow.fromWebContents(e.sender)!
    const winData = WindowHandler.allWindows.get(whiteboardID)
    if(winData){
        WindowHandler.openComponent(WindowTypes.whiteboard, whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),
            winData.isMinimized, winData.isMaximized, winData.isFullScreen,
            winData.width, winData.height, winData.x, winData.y
        )
    }else WindowHandler.openComponent(WindowTypes.whiteboard, whiteboardID, WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id))
})

ipcMain.handle('open-link', async (e, link) => {
    const win = BrowserWindow.fromWebContents(e.sender)!
        //WindowHandler.openComponent('l', link,+--------------------------------------------------poooooooooooooooooooooooooooooooooo WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id),

    await WindowHandler.createWindow(WindowTypes.link, null, false, false, false,
        undefined, undefined, undefined, undefined, link);
    WindowHandler.initialiseWindow(win.id, WindowTypes.link, getLinkID(), WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id), link);
})

ipcMain.handle('get-link', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)!;
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(win.id);
    return WindowHandler.allWindows.get(symbolicWinID)!.url;
})

ipcMain.handle('save-editor-contents', async (e, contents) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!;
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id);
    const componentID = WindowHandler.allWindows.get(symbolicID)!.componentID;
    const savesJSON = path.join(saved.notepadsPath, `${componentID}.json`);
    await writeFile(savesJSON, JSON.stringify(contents, null, 2), 'utf-8');
})

ipcMain.handle('load-editor-contents', async (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID)!.componentID
    const savesJSON = path.join(saved.notepadsPath, `${componentID}.json`)
    if(!(await fileExists(savesJSON)))
        await writeFile(savesJSON, JSON.stringify({}, null, 2), 'utf-8');

    const fileContents = await readFile(savesJSON, 'utf-8')
    const delta = JSON.parse(fileContents)
    return delta
})

ipcMain.handle('first-time-notepad-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    WindowHandler.overwriteComponentWindow(defaultNotepadHTML, senderWindow.id, WindowTypes.notepad, addNotepad())
})

ipcMain.handle('first-time-whiteboard-chosen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    WindowHandler.overwriteComponentWindow(defaultWhiteboardHTML, senderWindow.id, WindowTypes.whiteboard, addWhiteboard())
})

ipcMain.handle('get-window-component-id', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    return WindowHandler.allWindows.get(symbolicWinID)!.componentID
})

ipcMain.on('save-whiteboard-html', async (e, html) => {
    console.log('saving html in main')
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    console.log('save html wb: ' + symbolicWinID)
    const componentID = WindowHandler.allWindows.get(symbolicWinID)!.componentID
    const saveWhiteboardDir = path.join(saved.whiteboardsPath, `${componentID}`)
    await mkdir(saveWhiteboardDir, { recursive: true })
    const saveWhiteboardHTML = path.join(saveWhiteboardDir, `${componentID}-index.html`)
    if (!html.includes('../../../')) {
        html = html.replace(/(src|href)="(\.\.\/)/g, '$1="../$2');
    }
    await writeFile(saveWhiteboardHTML, html, 'utf-8');
})

ipcMain.on('save-whiteboard-state', async (e, stateObj) => {
    console.log('saving state in main')
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWinID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    console.log('save json wb: ' + symbolicWinID)
    const componentID = WindowHandler.allWindows.get(symbolicWinID)!.componentID
    const saveWhiteboardDir = path.join(saved.whiteboardsPath, `${componentID}`)
    await mkdir(saveWhiteboardDir, { recursive: true })
    
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
        allNotes: stateObj.allNotes,
        allElementConnections: stateObj.allElementConnections,
        isTitlebarLocked: stateObj.isTitlebarLocked,
        zoomFactor: stateObj.zoomFactor,
        boardOffset: stateObj.boardOffset,
        wbOffset: stateObj.wbOffset
    } satisfies WBSave

    const saveWhiteboardState = path.join(saveWhiteboardDir, `${componentID}-state.json`)
    await writeFile(saveWhiteboardState, JSON.stringify(dataToSave, null, 2), 'utf-8');
})

ipcMain.handle('load-whiteboard-state', async (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    const componentID = WindowHandler.allWindows.get(symbolicID)!.componentID
    const saveWhiteboardState = path.join(saved.whiteboardsPath, `${componentID}`,  `${componentID}-state.json`)
    if (await fileExists(saveWhiteboardState))
        return JSON.parse(await readFile(saveWhiteboardState, 'utf-8'))
    return {}
})

ipcMain.handle('set-mouse-position', (e, pos: Vector2D) => {
    robot.moveMouse(pos.x, pos.y)
})

ipcMain.handle('move-window', (event, bounds) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    win.setBounds(bounds)
})

ipcMain.handle('is-fullscreen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    return senderWindow.isFullScreen()
})

ipcMain.handle('set-fullscreen', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID)!.isFullScreen = !senderWindow.isFullScreen()
    senderWindow.setFullScreen(!senderWindow.isFullScreen())
    
})

ipcMain.handle('set-maximized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID)!.isMaximized = !senderWindow.isMaximized()
    if(senderWindow.isMaximized()) senderWindow.unmaximize()
    else senderWindow.maximize()
})

ipcMain.handle('set-minimized', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!
    const symbolicWindowID = WindowHandler.trueWinIDToSymbolicWinIDMapping.get(senderWindow.id)
    WindowHandler.allWindows.get(symbolicWindowID)!.isMinimized = true
    senderWindow.minimize()
})

ipcMain.handle('remove-from-windows', (e) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender)!;
    WindowHandler.removeFromWindows(senderWindow.id);
})

ipcMain.handle('close-window', async (e) => {
    const windows = BrowserWindow.getAllWindows();
    if(windows.length === 1){
        terminateApp();
    }else{
        const senderWindow = BrowserWindow.fromWebContents(e.sender)!;
        WindowHandler.isClosingWindow = true;
        WindowHandler.closeWindow(senderWindow.id);
    }
});