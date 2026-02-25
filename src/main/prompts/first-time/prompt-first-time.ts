import * as Titlebar from '../../../ui/titlebars/titlebar.js'

Titlebar.initTitlebar();
StatesHandler.isPromptFirstTime = true

function closeWindow(){
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
})

document.getElementById('notepad-choice').addEventListener('click', () => {
    window.wandererAPI.firstTimeNotepadChosen()
})

document.getElementById('whiteboard-choice').addEventListener('click', () => {
    window.wandererAPI.firstTimeWhiteboardChosen()
})

document.getElementById('help-link').addEventListener('click', () => {
    window.wandererAPI.openLink('https://github.com/NojusKondrotas/wanderer')
})