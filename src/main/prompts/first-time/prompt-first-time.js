initTitlebar()
StatesHandler.isPromptFirstTime = true

function closeWindow(){
    window.wandererAPI.closeWindow()
}

document.getElementById('notepad-choice').addEventListener('click', () => {
    window.wandererAPI.firstTimeNotepadChosen()
})

document.getElementById('whiteboard-choice').addEventListener('click', () => {
    window.wandererAPI.firstTimeWhiteboardChosen()
})

document.getElementById('help-link').addEventListener('click', () => {
    window.wandererAPI.openLink('https://github.com/NojusKondrotas/wanderer')
})