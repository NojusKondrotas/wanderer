import { closeWindow } from "../../main/whiteboard-renderer.js";
import { displayConfigs } from "../configs-menu/configs.js";
import { titlebarToggleFullScreen, titlebarToggleMaximized, titlebarToggleMinimized } from "../titlebars/titlebar.js";
import { ContextMenuRegister, createContextMenu, createContextMenuCircular } from "./handler-context-menu.js";

export const tcm: string = "tcm";

export function registerTitlebarCM(identifier: string) {
    const titlebarCM = document.getElementById('titlebar-context-menu');

    if(titlebarCM)
        return ContextMenuRegister.registerContextMenu(
            identifier,
            createContextMenuCircular(
                createContextMenu(
                    titlebarCM,
                    (titlebarCM.children) as HTMLCollectionOf<HTMLElement>,
                    -10,
                    -10
                ),
                360 / titlebarCM.children.length,
                85,
                234
            )
        );
}

const tcmOpts = [
    document.getElementById('tcm-fullscreen-window'),
    document.getElementById('tcm-maximize-window'),
    document.getElementById('tcm-minimize-window'),
    document.getElementById('tcm-close-window'),
    document.getElementById('tcm-global-config-menu')
];

tcmOpts[0]!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[0]!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleFullScreen();
});

tcmOpts[1]!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[1]!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMaximized();
});

tcmOpts[2]!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[2]!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    titlebarToggleMinimized();
});

tcmOpts[3]!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[3]!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    closeWindow();
});

tcmOpts[4]!.addEventListener('mousedown', (e) => {
    e.stopPropagation();
});
tcmOpts[4]!.addEventListener('mouseup', (e) => {
    e.stopPropagation();

    if(e.button === 2){
        return;
    }

    displayConfigs(1, 1);
});