import { openPathConnectionContextMenu } from "../../instantiable-components/path-connection-handler.js";
import { deletePathByID, selectedPath } from "../../instantiable-components/path.js";
import { ContextMenuRegister, createContextMenu, createContextMenuCircular, turnOffContextMenu } from "./handler-context-menu.js";

export const acm: string = "acm";

export function registerPathCM(identifier: string) {
    const pathContextMenu = document.getElementById('path-context-menu');

    if(pathContextMenu)
        return ContextMenuRegister.registerContextMenu(identifier, 
            createContextMenuCircular(
                createContextMenu(
                    pathContextMenu,
                    (pathContextMenu.children) as HTMLCollectionOf<HTMLElement>,
                    0,
                    -10
                ),
                360 / pathContextMenu.children.length,
                70,
                90,
            )
        );
}

document.getElementById('acm-connect')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-connect')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    openPathConnectionContextMenu(true);
});

document.getElementById('acm-disconnect')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-disconnect')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    console.log('acm-disconnect');

    if(e.button === 2){
        return;
    }

    openPathConnectionContextMenu(false);
});

document.getElementById('acm-delete')!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
document.getElementById('acm-delete')!.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    
    if(e.button === 2){
        return;
    }

    deletePathByID(selectedPath!.ID);

    turnOffContextMenu();
});