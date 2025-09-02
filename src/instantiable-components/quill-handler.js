function toggleQuillWritingMode(toggle = false, editableEl = null){
    if(toggle){
        isWritingElement = true
        isDraggingElement = false
        if(editableEl) editableEl.querySelector(':scope > .ql-editor').contentEditable = 'true'
    }
    else{
        isWritingElement = false
        isDraggingElement = true
        if(editableEl) editableEl.querySelector(':scope > .ql-editor').contentEditable = 'false'
    }
}

function configureQuill(ql_container, content = ''){
    const editor = ql_container.querySelector(':scope > .ql-editor')
    editor.textContent = content
    editor.contentEditable = 'false'

    ql_container.querySelector(':scope > .ql-clipboard').remove()
}

function createQuill(parent){
    return quill = new Quill(parent, {
        modules: {
            toolbar: false,
        }
    })
}