import { AppStates } from "../runtime/states-handler.js"
import { openNewContextMenu } from "../ui/context-menus/handler-context-menu.js"
import { ecm } from "../ui/context-menus/whiteboard/element-cm.js"
import { isCombo, KeybindIndices, keybinds } from "../ui/keybinds.js"
import { wbZoom } from "../ui/parent-whiteboard-handler.js"
import { getAbsolutePosition, setElementLeftPos, setElementTopPos, WhiteboardPositioningHandler } from "../ui/positioning/whiteboard-positioning.js"
import { convertToWhiteboardSpace } from "../ui/zoom-whiteboard.js"
import { createNewElement, createNewElementLeftAlignment, deleteComponentByID, getElementID, instantiateResizingBorders, selectedElement, setSelectedElement } from "./component-handler.js"
import { instantiateHierarchy, switchFocus, switchFocusToChild, switchFocusToParent } from "./hierarchy-handler.js"
import { createPath } from "./path.js"

export let allNotes = new Map()

export function setAllNotes(map) {
    allNotes = map
}

export let activeBorder: string | null = null

export function setActiveBorder(border: string | null) {
    activeBorder = border
}

export let largestNoteContainerID = 0, unusedNoteContainerIDs = new Array()
export const setLargestNoteContainerID = (id) => largestNoteContainerID = id;
export const setUnusedNoteContainerIDs = (ids) => unusedNoteContainerIDs = ids;

function getNoteContainerID(){
    if(unusedNoteContainerIDs.length !== 0)
        return unusedNoteContainerIDs.pop()
    else{
        ++largestNoteContainerID
        return `note-container-${largestNoteContainerID - 1}`
    }
}

function getEditableNote(noteID){
    const note = document.getElementById(noteID)!
    const p = note.querySelector('p')
    return p
}

export function toggleWritingMode(toggle = false, editableElContainerID){
    const editableElContainer = document.getElementById(editableElContainerID)!
    const editableEl = getEditableNote(editableElContainerID)!
    if(toggle){
        editableEl.style.userSelect = 'auto'
        editableEl.contentEditable = 'true'
        editableEl.focus()

        AppStates.isWritingElement = true
        setSelectedElement(editableElContainer)
    }
    else{
        editableEl.contentEditable = 'false'
        editableEl.style.userSelect = 'none'
        
        AppStates.isWritingElement = false
        setSelectedElement(null)
    }
}

export function saveAllNotesContents(){
    document.querySelectorAll('.note-container').forEach(note => allNotes.set(note.id, {
        contents: document.getElementById(note.id)!.querySelector('p')!.textContent,
        paths: allNotes.get(note.id).paths
    }))
}

export function reinstateAllNotesContents(){
    const entries = allNotes.entries();
    for(const [k, v] of entries){
        const el = document.getElementById(k)
        const p = el!.querySelector('p')
        p!.innerHTML = v.contents
    }
}

function addNoteEditableListeners(noteEd) {
    noteEd.addEventListener('mouseenter', () => {
        if(!AppStates.isDragging) {
            document.body.style.cursor = 'text';
        }
    })

    noteEd.addEventListener('mouseleave', () => {
        if(!AppStates.isDragging) {
            document.body.style.cursor = 'default';
        }
    })
}

export function addNoteListeners(newNote){
    newNote.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id)
        
        setSelectedElement(newNote)

        openNewContextMenu(e.clientX, e.clientY, ecm)
    })

    newNote.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        if(AppStates.isWritingElement) return
        WhiteboardPositioningHandler.element_MouseDown(e, newNote)
    })

    newNote.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        WhiteboardPositioningHandler.element_MouseUp(e, newNote)
    })

    newNote.addEventListener('click', (e) => {
        if(AppStates.willNotWrite) return;

        if(!AppStates.isWritingElement){
            toggleWritingMode(true, newNote.id)
        } else {
            switchFocus(selectedElement!.id, newNote.id);
        }

        setSelectedElement(newNote)
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY)!
        let range = document.createRange()
        range.setStart(pos.offsetNode, pos.offset)
        range.collapse(true)

        if (range) {
            const sel = window.getSelection()!
            sel.removeAllRanges()
            sel.addRange(range)
        }
    })

    newNote.addEventListener('keydown', (e) => {
        if(isCombo(keybinds[KeybindIndices.noteWriteFocusDown])){
            switchFocusToChild(newNote.id)
        }
        if(isCombo(keybinds[KeybindIndices.noteWriteFocusUp])){
            switchFocusToParent(newNote.id)
        }

        if(e.key === 'Enter'){
            e.preventDefault();
            const posParent = getAbsolutePosition(newNote);
            const childNote = createNewNoteLeftAlignment(wbZoom, '', new Set([newNote.id]), new Set(), posParent.left, posParent.top + posParent.height);
            setElementLeftPos(childNote.id, convertToWhiteboardSpace(posParent.left, -1).x);
            setElementTopPos(childNote.id, Math.floor(convertToWhiteboardSpace(-1, posParent.top + posParent.height).y));
            const posChild = getAbsolutePosition(childNote);
            createPath(wbZoom,
                { x: posParent.left + posParent.width / 2, y: posParent.top + posParent.height / 2 },
                { x: posChild.left + posChild.width / 2, y: posChild.top + posChild.height / 2 },
                newNote.id, childNote.id, false, false, false)
            switchFocus(newNote.id, childNote.id)
        }
    })
}

export function createNewNote(container, content = '', parent_ids = new Set(), child_ids = new Set(), centerX = 0, centerY = 0){
    const newNote = document.createElement('div')
    const p = document.createElement('p')
    newNote.classList.add('note-container')
    p.id = getElementID()
    p.classList.add('note')
    p.spellcheck = false
    addNoteEditableListeners(p);
    newNote.appendChild(p)

    createNewElement(container, newNote, getNoteContainerID(), centerX, centerY)
    instantiateHierarchy(newNote.id, parent_ids, child_ids)
    addNoteListeners(newNote)
    instantiateResizingBorders(newNote)
    allNotes.set(newNote.id, {
        contents: "",
        paths: []
    });

    return newNote;
}

function createNewNoteLeftAlignment(container, content = '', parent_ids = new Set(), child_ids = new Set(), offsetX = 0, offsetY = 0){
    const newNote = document.createElement('div')
    const p = document.createElement('p')
    newNote.classList.add('note-container')
    p.id = getElementID()
    p.classList.add('note')
    p.spellcheck = false
    addNoteEditableListeners(p);
    newNote.appendChild(p)

    createNewElementLeftAlignment(container, newNote, getNoteContainerID(), offsetX, offsetY)
    instantiateHierarchy(newNote.id, parent_ids, child_ids)
    addNoteListeners(newNote)
    instantiateResizingBorders(newNote);
    allNotes.set(newNote.id, {
        contents: "",
        paths: []
    });

    return newNote
}

export function deleteNoteByID(container, n_id){
    deleteComponentByID(container, n_id, [getEditableNote(n_id)!.id]);
    unusedNoteContainerIDs.push(n_id);
    allNotes.delete(n_id);
}