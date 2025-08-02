let currClipboardID = 0

function generateRandom(minRange = 0x1000, maxRange = 0xffffffff){
    return Math.floor(Math.random() * maxRange + minRange)
}

function IDClipboardContent(content, minRange = 0x1000, maxRange = 0xffffffff){
    currClipboardID = generateRandom(minRange, maxRange).toString(16)
    
    let text = `[${currClipboardID}]` + content
    
    return text
}

function parseClipboardElement(elementIDHTML){
    let HTMLContent, isHTML = false
    
    if(elementIDHTML[0] === '['){
        if(elementIDHTML.substring(1, elementIDHTML.indexOf(']')) === currClipboardID)
            HTMLContent = elementIDHTML.substring(elementIDHTML.indexOf(']') + 1)
        else return {isHTML: isHTML, parsedString: elementIDHTML}
    }
    else return {isHTML: isHTML, parsedString: elementIDHTML}
    isHTML = true
    
    const template = document.createElement('template');
    template.innerHTML = HTMLContent.trim();

    const newElement = template.content;

    return {isHTML: isHTML, parsedString: newElement}
}