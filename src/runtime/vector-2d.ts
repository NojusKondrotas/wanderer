import { Vector2DLike } from "../main/types/vector-2d.js";

export class Vector2D implements Vector2DLike {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}