const { app, BrowserWindow } = require('electron')

let whiteboard;
function initialiseApp(){
    whiteboard = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        fullscreen: true
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