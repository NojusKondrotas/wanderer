class MouseDragHandler {
    static dragStart = { x: 0, y: 0 }
    static dragDiff = { x: 0, y: 0 }
    static dragTotalStart = { x: 0, y: 0 }
    static dragTotalDiff = { x: 0, y: 0 }
    static dragAbsoluteTotalDiff = { x: 0, y: 0 }

    static resetMouseDrag(ev){
        let boardSpace = { x: ev.screenX, y: ev.screenY }
        if (StatesHandler.isComponentWhiteboard) {
            boardSpace = convertToZoomSpace(ev.screenX, ev.screenY)
        }

        this.dragStart = boardSpace
        this.dragTotalStart = boardSpace
        this.dragDiff = { x: 0, y: 0 }
        this.dragTotalDiff = { x: 0, y: 0 }
        this.dragAbsoluteTotalDiff = { x: 0, y: 0 }
    }

    static updateMouseDrag(ev){
        let boardSpace = { x: ev.screenX, y: ev.screenY }
        if (StatesHandler.isComponentWhiteboard) {
            boardSpace = convertToZoomSpace(ev.screenX, ev.screenY)
        }

        this.dragDiff = {
            x: this.dragStart.x - boardSpace.x,
            y: this.dragStart.y - boardSpace.y
        }
        this.dragStart = boardSpace
        this.dragAbsoluteTotalDiff.x += Math.abs(this.dragDiff.x)
        this.dragAbsoluteTotalDiff.y += Math.abs(this.dragDiff.y)
    }

    static checkIfDraggedEnough(){
        return this.dragAbsoluteTotalDiff.x > 10 || this.dragAbsoluteTotalDiff.y > 10
    }
}