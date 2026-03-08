import { AppStates } from "../runtime/states-handler.js";

let keybindGuide: HTMLElement;
let keybindGuideCloseCtrl: HTMLElement;
let keybindGuideCloseImg: HTMLElement;
let keybindContainer: HTMLElement;
let keybindContainerChildren: HTMLCollection;

export function initKeybindGuide() {
    const keybindGuideTmp = document.getElementById('keybind-guide');
    const keybindGuideCloseCtrlTmp = document.getElementById('keybind-guide-close')
    const keybindGuideCloseImgTmp = document.getElementById('kbn-gd-cl-img')
    const keybindContainerTmp = document.getElementById('keybind-container')

    if(!keybindGuideTmp || !keybindGuideCloseCtrlTmp || !keybindGuideCloseImgTmp || !keybindContainerTmp) {
        throw new Error("Some keybind dom elements not found, cannot proceed");
    }

    const keybindContainerChildrenTmp = keybindContainerTmp.children;

    keybindGuide = keybindGuideTmp;
    keybindGuideCloseCtrl = keybindGuideCloseCtrlTmp;
    keybindGuideCloseImg = keybindGuideCloseImgTmp;
    keybindContainer = keybindContainerTmp;
    keybindContainerChildren = keybindContainerChildrenTmp;

    document.getElementById('keybind-guide-close')!.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleKeybindGuideAppearance(false);
        keybindGuide.style.display = 'none';
    })
}

function keybindGuide_MouseOverHandler(){
    for(let child of Array.from(keybindContainerChildren as HTMLCollectionOf<HTMLElement>)) {
        child.style.color = 'rgba(10, 10, 10, 1)';
    }
    keybindGuideCloseImg.style.opacity = '1';
}

function keybindGuide_MouseOutHandler(){
    keybindGuideCloseImg.style.opacity = '0';
    for(let child of Array.from(keybindContainerChildren as HTMLCollectionOf<HTMLElement>)) {
        child.style.color = 'rgba(10, 10, 10, 0.33)';
    }
}

export function handleKeybindGuideAppearance(flag){
    if(AppStates.isPromptConfigs) return;
    
    if(flag){
        keybindGuide.style.pointerEvents = "auto";
        keybindGuideCloseImg.style.color = '0';
        for(let child of Array.from(keybindContainerChildren as HTMLCollectionOf<HTMLElement>)) {
            child.style.color = 'rgba(10, 10, 10, 0.33)';
        }
        keybindGuide.addEventListener('mouseover', keybindGuide_MouseOverHandler);

        keybindGuide.addEventListener('mouseout', keybindGuide_MouseOutHandler);
    }else{
        keybindGuide.style.pointerEvents = "none";
        keybindGuideCloseImg.style.opacity = '0';
        for(let child of Array.from(keybindContainerChildren as HTMLCollectionOf<HTMLElement>)) {
            child.style.color = 'rgba(10, 10, 10, 0)';
        }
        keybindGuide.removeEventListener('mouseover', keybindGuide_MouseOverHandler);

        keybindGuide.removeEventListener('mouseout', keybindGuide_MouseOutHandler);
    }
}