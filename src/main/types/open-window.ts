import { WindowTypes } from "../main.js"
import { WandererWindow } from "./wanderer-window.js"

export type OpenWindow = {
    symbolicWindowID: string,
    windowType: WindowTypes,
    componentID: string
}

export function createOpenWindow(symbolicWindowID: string, window: WandererWindow): OpenWindow {
    const { windowType, componentID } = window;
    return { symbolicWindowID, windowType, componentID } satisfies OpenWindow;
}