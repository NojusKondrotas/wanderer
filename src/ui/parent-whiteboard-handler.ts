export let wbMovement: HTMLElement;
export let wbZoom: HTMLElement;

export function initWhiteboards() {
    const wbMovementLocal = document.getElementById('wb-movement');
    const wbZoomLocal = document.getElementById('wb-zoom');

    if(!wbMovementLocal || !wbZoomLocal) {
        throw new Error("Whiteboards not found");
    }

    wbMovement = wbMovementLocal;
    wbZoom = wbZoomLocal;
}