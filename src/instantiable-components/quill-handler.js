let allQuills = new Map(), allQuillToolbars = new Map()

let activeQlToolbar = null, isQuillToolbarEdit = false

function queryQuillToolbar(qlToolbarID){
    return document.querySelector(`[data-parent-id="${qlToolbarID}"]`)
}

function updateQuillToolbarPosition(component){
    const componentRect = component.getBoundingClientRect()
    const quillToolbarRect = activeQlToolbar.getBoundingClientRect()
    const x = elementPositions.get(component.id).x + componentRect.width / 2
    const y = elementPositions.get(component.id).y - quillToolbarRect.height
    activeQlToolbar.style.left = `${x}px`
    activeQlToolbar.style.top = `${y}px`
}

function toggleQuillWritingMode(toggle = false, editableElID){
    const editableEl = document.getElementById(editableElID)
    if(toggle){
        editableEl.querySelector(':scope > .ql-editor').contentEditable = 'true'

        activeQlToolbar = queryQuillToolbar(editableElID)
        activeQlToolbar.style.display = 'inline'
        updateQuillToolbarPosition(editableEl)

        isWritingElement = true
        selectedElement = editableEl
    }
    else{
        editableEl.querySelector(':scope > .ql-editor').contentEditable = 'false'
        if(activeQlToolbar) activeQlToolbar.style.display = 'none'

        activeQlToolbar = null
        isWritingElement = false
        selectedElement = null
    }
}

function configureQuill(quill, ql_container, content = ''){
    const editor = ql_container.querySelector(':scope > .ql-editor')
    quill.setContents(content)
    editor.contentEditable = 'false'

    ql_container.querySelector(':scope > .ql-clipboard').remove()
}

function configureQuillToolbar(qlToolbar){
    qlToolbar.addEventListener('mousedown', (e) => { e.stopPropagation(); isQuillToolbarEdit = true })
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