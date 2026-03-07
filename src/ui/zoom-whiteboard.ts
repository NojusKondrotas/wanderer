import { wbOffset } from "./positioning/whiteboard-positioning.js"
import { wbZoom } from "./parent-whiteboard-handler.js"
import { Vector2D } from "../runtime/numerics.js"

export let zoomFactor = 1.0;
export const setZoomFactor = (factor: number) => zoomFactor = factor;
export const zoomStep = 1.4;
export let boardOffset = new Vector2D(0, 0);
export const setBoardOffset = (offset: Vector2D) => boardOffset = offset;

export function zoomWhiteboard(mousePos: Vector2D, zoomIn = false){
    const oldZoom = zoomFactor
    if(zoomIn)
        zoomFactor = Math.min(zoomFactor * zoomStep, 8);
    else zoomFactor = Math.max(zoomFactor / zoomStep, 0.1);

    const scaleChange = zoomFactor / oldZoom

    const mx = mousePos.x - wbOffset.x
    const my = mousePos.y - wbOffset.y

    boardOffset.x = mx - scaleChange * (mx - boardOffset.x)
    boardOffset.y = my - scaleChange * (my - boardOffset.y)
    
    wbZoom.style.transform = `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${zoomFactor})`
}

export function convertToWhiteboardSpace(x: number, y: number) {
    return new Vector2D(
        (x - wbOffset.x - boardOffset.x) / zoomFactor,
        (y - wbOffset.y - boardOffset.y) / zoomFactor
    )
}

export function convertFromWhiteboardSpace(x: number, y: number){
    return new Vector2D(
        x * zoomFactor + boardOffset.x + wbOffset.x,
        y * zoomFactor + boardOffset.y + wbOffset.y,
    )
}

export function convertToZoomSpace(x: number, y: number) {
    return new Vector2D(
        (x - boardOffset.x) / zoomFactor,
        (y - boardOffset.y) / zoomFactor
    )
}

export function convertFromZoomSpace(x: number, y: number) {
    return new Vector2D(
        x * zoomFactor + boardOffset.x,
        y * zoomFactor + boardOffset.y,
    )
}