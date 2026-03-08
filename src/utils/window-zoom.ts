import { Vector2D } from "../runtime/vector-2d.js";
import { zoomWhiteboard } from "../ui/zoom-whiteboard.js";

export function initWindowZoom() {
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIn = e.deltaY < 0;
        zoomWhiteboard(new Vector2D(e.clientX, e.clientY ), zoomIn);
    }, { passive: false });
}