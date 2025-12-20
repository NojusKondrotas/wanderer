const keybindGuide = document.getElementById('keybind-guide');
const keybindGuideCloseCtrl = document.getElementById('keybind-guide-close');
const keybindGuideCloseImg = document.getElementById('kbn-gd-cl-img');
const keybindContainer = document.getElementById('keybind-container');
const keybindContainerChildren = keybindContainer.children;

function keybindGuide_MouseOverHandler(){
    for(let child of keybindContainerChildren){
        child.style.color = 'rgba(126, 135, 135, 1)';
    }
    keybindGuideCloseImg.style.opacity = '1';
}

function keybindGuide_MouseOutHandler(){
    keybindGuideCloseImg.style.opacity = '0';
    for(let child of keybindContainerChildren){
        child.style.color = 'rgba(126, 135, 135, 0.33)';
    }
}

function handleKeybindGuideAppearance(flag){
    if(flag){
        keybindGuide.style.pointerEvents = "auto";
        keybindGuideCloseImg.style.color = '0';
        for(let child of keybindContainerChildren){
            child.style.color = 'rgba(126, 135, 135, 0.33)';
        }
        keybindGuide.addEventListener('mouseover', keybindGuide_MouseOverHandler);

        keybindGuide.addEventListener('mouseout', keybindGuide_MouseOutHandler);
    }else{
        keybindGuide.style.pointerEvents = "none";
        keybindGuideCloseImg.style.opacity = '0';
        for(let child of keybindContainerChildren){
            child.style.color = 'rgba(126, 135, 135, 0)';
        }
        keybindGuide.removeEventListener('mouseover', keybindGuide_MouseOverHandler);

        keybindGuide.removeEventListener('mouseout', keybindGuide_MouseOutHandler);
    }
}

document.getElementById('keybind-guide-close').addEventListener('mousedown', (e) => {
    e.stopPropagation();
    handleKeybindGuideAppearance(false);
    keybindGuide.style.display = 'none';
})