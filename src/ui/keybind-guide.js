const keybindGuide = document.getElementById('keybind-guide')
const keybindGuideCloseCtrl = document.getElementById('keybind-guide-close')
const keybindContainer = document.getElementById('keybind-container')
const keybindContainerChildren = keybindContainer.children

handleKeybindGuideAppearance(true)

function keybindGuide_MouseOverHandler(){
    for(let child of keybindContainerChildren){
        child.style.color = 'rgba(126, 135, 135, 1)'
    }
    keybindGuideCloseCtrl.style.color = 'rgba(126, 135, 135, 1)'
}

function keybindGuide_MouseOutHandler(){
    keybindGuideCloseCtrl.style.color = 'rgba(126, 135, 135, 0)'
    for(let child of keybindContainerChildren){
        child.style.color = 'rgba(126, 135, 135, 0.33)'
    }
}

function handleKeybindGuideAppearance(flag){
    if(flag){
        keybindGuideCloseCtrl.style.color = 'rgba(126, 135, 135, 0)'
        for(let child of keybindContainerChildren){
            child.style.color = 'rgba(126, 135, 135, 0.33)'
        }
        keybindGuide.addEventListener('mouseover', keybindGuide_MouseOverHandler)

        keybindGuide.addEventListener('mouseout', keybindGuide_MouseOutHandler)
    }else{
        keybindGuideCloseCtrl.style.color = 'rgba(126, 135, 135, 0)'
        for(let child of keybindContainerChildren){
            child.style.color = 'rgba(126, 135, 135, 0)'
        }
        keybindGuide.removeEventListener('mouseover', keybindGuide_MouseOverHandler)

        keybindGuide.removeEventListener('mouseout', keybindGuide_MouseOutHandler)
    }
}

document.getElementById('keybind-guide-close').addEventListener('mousedown', (e) => {
    e.stopPropagation()
    handleKeybindGuideAppearance(false)
    keybindGuide.style.display = 'none'
})