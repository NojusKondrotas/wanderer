import { Vector2D } from "../../runtime/vector-2d.js";
import { closeWindow } from "../../utils/close-window.js";
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

export function initTitlebarCMOptions() {
    const FULLSCREEN = document.getElementById('tcm-fullscreen-window');
    const MAXIMIZE = document.getElementById('tcm-maximize-window');
    const MINIMIZE = document.getElementById('tcm-minimize-window');
    const CLOSE = document.getElementById('tcm-close-window');
    const CONFIG = document.getElementById('tcm-global-config-menu');

    if(!FULLSCREEN || !MAXIMIZE || !MINIMIZE
        || !CLOSE || !CONFIG
    ) {
        throw new Error("Some options of titlebar context menu not found, cannot proceed");
    }

    FULLSCREEN.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    FULLSCREEN.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        titlebarToggleFullScreen();
    });

    MAXIMIZE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    MAXIMIZE.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        titlebarToggleMaximized();
    });

    MINIMIZE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    MINIMIZE.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        titlebarToggleMinimized();
    });

    CLOSE.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    CLOSE.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        closeWindow();
    });

    CONFIG.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    CONFIG.addEventListener('mouseup', (e) => {
        e.stopPropagation();

        if(e.button === 2){
            return;
        }

        displayConfigs(new Vector2D(1, 1));
    });
}