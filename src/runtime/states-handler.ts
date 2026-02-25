class StatesHandler{
    isWritingElement = false
    willNotWrite = false

    isDragging = false

    isConnecting = false
    isDrawingPath = false
    isDrawingPathEnd = false

    isContextMenuOpen = false

    isTabsMenuOpen = false

    isTitlebarLocked = false

    ////////////////////////////////

    isPromptFirstTime = false
    isPromptLink = false
    isComponentNotepad = false
    isComponentWhiteboard = false
}

export const AppStates = new StatesHandler();