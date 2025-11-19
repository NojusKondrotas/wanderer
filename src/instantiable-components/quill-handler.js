let allQuills = new Map(), allQuillToolbars = new Map()

let activeQlToolbar = null

function toggleWritingMode(toggle = false, editableElID){
    const editableEl = document.getElementById(editableElID)
    if(toggle){
        editableEl.style.userSelect = 'auto'
        editableEl.contentEditable = 'true'

        StatesHandler.isWritingElement = true
        selectedElement = editableEl
    }
    else{
        editableEl.contentEditable = 'false'
        editableEl.style.userSelect = 'none'
        
        StatesHandler.isWritingElement = false
        selectedElement = null
    }
}

function configureQuillToolbar(qlToolbar){
    qlToolbar.addEventListener('mousedown', (e) => { e.stopPropagation(); StatesHandler.isQuillToolbarEdit = 2 })
}

function saveAllQuillToolbars(){
    document.querySelectorAll('.note').forEach(qlEditor => allQuillToolbars.set(qlEditor.id, allQuills.get(qlEditor.id).getContents()))
    document.querySelectorAll('.ql-toolbar').forEach(toolbar => toolbar.remove())
}

function reinstateAllQuillToolbars(){
    for(let [key, value] of elementPositions){
        const el = document.getElementById(key)
        if(el.classList.contains('note'))
            createQuill(key, allQuillToolbars.get(key))
    }
}

function initQuill(parent, contents = ''){
    const toolbarOptions = [
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
    ]
    const quill = new Quill(parent, {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
    })
    quill.setContents(contents)

    return quill
}

function createQuill(parentID, content = ''){
    const parent = document.getElementById(parentID)
    const quill = initQuill(parent)

    configureQuill(quill, parent, content)

    const quillToolbar = parent.previousSibling
    quillToolbar.setAttribute('data-parent-id', parent.id)
    configureQuillToolbar(quillToolbar)

    const editor = parent.querySelector('.ql-editor')
    let idEditor = getQlEditorID()
    editor.id = idEditor

    allQuills.set(parentID, quill)
}