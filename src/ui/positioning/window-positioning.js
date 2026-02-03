class WindowPositioningHandler {
    static isDraggingWindow = false
    static isResizingWindow = false
    static windowDimensions = { width: 0, height: 0 }
    static windowCornerOffset = { x: 0, y: 0 }

    static resetWindowDrag(ev){
        this.isDraggingWindow = false
        this.isResizingWindow = false
        this.windowDimensions = { width: window.outerWidth, height: window.outerHeight }
        this.windowCornerOffset = {
            x: ev.screenX - window.screenX,
            y: ev.screenY - window.screenY
        }
    }

    static moveWindow(){
        const newX = MouseDragHandler.dragStart.x - this.windowCornerOffset.x
        const newY = MouseDragHandler.dragStart.y - this.windowCornerOffset.y

        window.wandererAPI.moveWindow(
            newX,
            newY,
            this.windowDimensions.width,
            this.windowDimensions.height
        )
    }

    static resizeWindow(){
        const dx = -MouseDragHandler.dragDiff.x
        const dy = -MouseDragHandler.dragDiff.y

        let { width, height } = this.windowDimensions
        let newX = window.screenX
        let newY = window.screenY

        width += dx
        height += dy

        window.wandererAPI.moveWindow(newX, newY, width, height)

        this.windowDimensions = { width, height }
    }
}