let quillToolbar = null

let isQuillToolbarDefined = false, isQuillToolbarEdit = false

function updateQuillToolbarPosition(component){
    const componentRect = component.getBoundingClientRect()
    const quillToolbarRect = quillToolbar.getBoundingClientRect()
    const x = elementPositions.get(component.id).x + componentRect.width / 2
    const y = elementPositions.get(component.id).y - quillToolbarRect.height
    quillToolbar.style.left = `${x}px`
    quillToolbar.style.top = `${y}px`
}

function toggleQuillWritingMode(toggle = false, editableEl){
    if(toggle){
        editableEl.querySelector(':scope > .ql-editor').contentEditable = 'true'

        quillToolbar.style.display = 'inline'
        updateQuillToolbarPosition(editableEl)

        isWritingElement = true
        selectedElement = editableEl
    }
    else{
        editableEl.querySelector(':scope > .ql-editor').contentEditable = 'false'
        quillToolbar.style.display = 'none'

        isWritingElement = false
        selectedElement = null
    }
}

function configureQuill(ql_container, content = ''){
    const editor = ql_container.querySelector(':scope > .ql-editor')
    editor.textContent = content
    editor.contentEditable = 'false'

    ql_container.querySelector(':scope > .ql-clipboard').remove()
}

function createQuill(parent){
    if(isQuillToolbarDefined)
        return quill = new Quill(parent, {
            theme: 'snow',
            modules: {
                toolbar: false
            }
        })
    else{
        isQuillToolbarDefined = true
        return quill = new Quill(parent, {
            theme: 'snow',
            modules: {
                toolbar: true
            }
        })
    }
}