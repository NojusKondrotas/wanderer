import { WindowTypes } from "../main.js"

export type WandererWindow = {
    trueWindowID: number
    x: number
    y: number
    width: number
    height: number
    isFullScreen: boolean
    isMinimized: boolean
    isMaximized: boolean
    windowType: WindowTypes
    componentID: string
    parentWindowID: string
    url: string | null
}