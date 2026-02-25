let copiedElements = new Map()

function copy(element){
    let elementID = generateUniqueHash(copiedElements)
    elementContent = element.textContent

    if(element.classList.contains('note'))
        copiedElements.set(elementID, { type : 'n', content : elementContent })
    else if(element.classList.contains('notepad'))
        copiedElements.set(elementID, { type : 'p', content : null /* implement */ })
    else if(element.classList.contains('whiteboard'))
        copiedElements.set(elementID, { type : 'w', content : null /* implement */ })

    navigator.clipboard.writeText(elementID)
}

async function readWandererClipboard(){
    return await navigator.clipboard.readText()
}

function parseClipboardElement(clipboardContent){
    if(copiedElements.has(clipboardContent))
        return {isHTML: true, element: copiedElements.get(clipboardContent)}
    return {isHTML: false, element: null}
}

// let contents = await navigator.clipboard.read()

// for (let item of contents){
//     if (item.types.includes('text/plain')) {
//         let blob = await item.getType('text/plain')
//         let text = await blob.text()
//         console.log(text)
//     }
// }