import { zoomFactor } from "../ui/zoom-whiteboard.js";
import { CopiedElement } from "./clipboard.js";
import { Vector2D } from "./vector-2d.js";

export function generateRandom(minRange = 0x1000, maxRange = 0xffffffff){
    return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
}

export function generateUniqueHash(map: Map<string, CopiedElement>, minRange = 0x1000, maxRange = 0xffffffff){
    let hash = convertToString(generateRandom(minRange, maxRange), 16)
    while(map.has(hash))
        hash = convertToString(generateRandom(minRange, maxRange), 16)
    
    return hash
}

export function convertToString(num: number, base = 10){
    return num.toString(base)
}

export function translateToElementMiddle(el: HTMLElement, v: Vector2D): Vector2D {
    const rect = el.getBoundingClientRect();
    return new Vector2D(v.x + (rect.left / 2) / zoomFactor, v.y + (rect.top / 2) / zoomFactor);
}