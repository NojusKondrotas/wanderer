import { openPathConnectionContextMenu, PathEditState } from "../../instantiable-components/path-connection-handler.js";
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

export function initPathCMOptions() {
    const CONNECT = document.getElementById('acm-connect');
    const DISCONNECT = document.getElementById('acm-disconnect');
    const DELETE = document.getElementById('acm-delete');

    if(!CONNECT || !DISCONNECT || !DELETE) {
        throw new Error("Some options of path context menu not found, cannot proceed");
    }


    CONNECT.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    CONNECT.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        openPathConnectionContextMenu(PathEditState.CONNECT);
    });

    DISCONNECT.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    DISCONNECT.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        console.log('acm-disconnect');

        if(e.button === 2){
            return;
        }

        openPathConnectionContextMenu(PathEditState.DISCONNECT);
    });

    DELETE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    DELETE.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        
        if(e.button === 2){
            return;
        }

        deletePathByID(selectedPath!.ID);

        turnOffContextMenu();
    });
}