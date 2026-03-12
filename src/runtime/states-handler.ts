import { PathEditState } from "../instantiable-components/path-connection-handler.js"

class StatesHandler{
    isWritingElement = false
    willNotWrite = false

    isDragging = false

    pathEditState: PathEditState = PathEditState.EMPTY
    isDrawingPath = false
    isDrawingPathEnd = false
    isDraggingPath = false

    isContextMenuOpen = false

    isTabsMenuOpen = false

    isTitlebarLocked = false

    ////////////////////////////////

    isPromptConfigs = false
    isPromptFirstTime = false
    isPromptLink = false
    isComponentNotepad = false
    isComponentWhiteboard = false
}

export const AppStates = new StatesHandler();