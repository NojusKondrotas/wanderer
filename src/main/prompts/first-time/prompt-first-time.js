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