import { Vector2DLike } from "../main/types/vector-2d.js";
import { CopiedElement } from "./clipboard.js";

export class Vector2D implements Vector2DLike {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

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