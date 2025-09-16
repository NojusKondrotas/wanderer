let currClipboardID = 0
let clipboardIDs = new Array(), copiedElements = new Map()

function copy(element){
    elementIDHTML = IDClipboardContent(element.outerHTML)
    elementContent = element.textContent

    writeElementWandererClipboard(elementIDHTML)
    navigator.clipboard.writeText(elementContent)
}

function IDClipboardContent(content, minRange = 0x1000, maxRange = 0xffffffff){
    currClipboardID = convertToString(generateRandom(minRange, maxRange), 16)
    clipboardIDs.push(currClipboardID)
    
    let text = `[${currClipboardID}]` + content
    
    return text
}

function writeElementWandererClipboard(elementIDHTML){
    copiedElements.push(elementIDHTML)
}

async function readElementWandererClipboard(){
    if(copiedElements.length === 0)
        return await navigator.clipboard.readText()
    
    return await copiedElements.pop()
}

function checkTextForLastClipboardID(text){
    if(text[0] === '['){
        if(text.substring(1, text.indexOf(']')) === currClipboardID)
            return true
        else return false
    }
    else return false
}

function checkTextForAnyClipboardID(text){
    if(text[0] === '['){
        if(clipboardIDs.includes(text.substring(1, text.indexOf(']'))))
            return true
        else return false
    }
    else return false
}

function parseClipboardElement(elementIDHTML){
    let HTMLContent, isHTML = false
    
    if(checkTextForLastClipboardID(elementIDHTML))
        HTMLContent = elementIDHTML.substring(elementIDHTML.indexOf(']') + 1)
    else return {isHTML: isHTML, parsedString: elementIDHTML}

    isHTML = true
    
    const template = document.createElement('template');
    template.innerHTML = HTMLContent.trim();

    const newElement = template.content;

    return {isHTML: isHTML, parsedString: newElement}
}

// let contents = await navigator.clipboard.read()

// for (let item of contents){
//     if (item.types.includes('text/plain')) {
//         let blob = await item.getType('text/plain')
//         let text = await blob.text()
//         console.log(text)
//     }
// }