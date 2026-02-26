import "../runtime/logger.js"
import "../runtime/error-handler.js"
import "../runtime/numerics.js"
import "../runtime/clipboard.js"
import "../runtime/states-handler.js"
import "../runtime/layout.js"
import "../ui/window-component-id-handler.js"
import "../ui/parent-whiteboard-handler.js"
import "../ui/titlebars/titlebar.js"
import "../ui/titlebars/whiteboard/lock.js"
import "../ui/context-menus/handler-context-menu.js"
import "../ui/context-menus/whiteboard/general-cm.js"
import "../ui/context-menus/whiteboard/element-cm.js"
import "../ui/context-menus/path-cm.js"
import "../ui/context-menus/titlebar-cm.js"
import "../ui/tabs-menu-handler.js"
import "../instantiable-components/hierarchy-handler.js"
import "../instantiable-components/component-handler.js"
import "../instantiable-components/path-connection-handler.js"
import "../instantiable-components/note.js"
import "../instantiable-components/notepad.js"
import "../instantiable-components/whiteboard.js"
import "../instantiable-components/path.js"
import "../ui/keybind-guide.js"
import "../ui/keybinds.js"
import "../ui/zoom-whiteboard.js"
import "../ui/positioning/mouse-drag-calc.js"
import "../ui/positioning/window-positioning.js"
import "../ui/positioning/whiteboard-positioning.js"

import { allElementConnections, configureAllElements, configureAllPaths, elementPositions, largestElementID, reinstateAllBorders, selectedElement, setAllElementConnections, setElementPositions, setLargestElID, setUnusedElIDs, unusedElementIDs } from "../instantiable-components/component-handler.js";
import { elementHierarchy, setElementHierarchy } from "../instantiable-components/hierarchy-handler.js";
import { allNotes, largestNoteContainerID, reinstateAllNotesContents, saveAllNotesContents, setAllNotes, setLargestNoteContainerID, setUnusedNoteContainerIDs, toggleWritingMode, unusedNoteContainerIDs } from "../instantiable-components/note.js";
import { allPaths, largestPathID, setAllPaths, setLargestPathID, setUnusedPathIDs, terminatePathDrawing, unusedPathIDs } from "../instantiable-components/path.js";
import { logMessage } from "../runtime/logger.js";
import { AppStates } from "../runtime/states-handler.js";
import { genMouseMove_ContextMenuHandler, openNewContextMenu } from "../ui/context-menus/handler-context-menu.js";
import { tcm } from "../ui/context-menus/titlebar-cm.js";
import { gcm } from "../ui/context-menus/whiteboard/general-cm.js";
import { handleKeybindGuideAppearance } from "../ui/keybind-guide.js";
import { pressedKeys } from "../ui/keybinds.js";
import { wbZoom } from "../ui/parent-whiteboard-handler.js";
import { genMouseDown_WhiteboardMoveHandler, genMouseMove_WhiteboardMoveHandler, genMouseUp_WhiteboardMoveHandler, setWBOffset, updateComponentPositionsByOffset, wbOffset } from "../ui/positioning/whiteboard-positioning.js";
import { closeTabsMenu, openTabsMenu } from "../ui/tabs-menu-handler.js";
import { initTitlebar } from "../ui/titlebars/titlebar.js";
import { setWindowComponentID, setWindowComponentIDEl, windowComponentID, windowComponentIDEl } from "../ui/window-component-id-handler.js";
import { boardOffset, setBoardOffset, setZoomFactor, zoomFactor, zoomWhiteboard } from "../ui/zoom-whiteboard.js";
import { WBSave } from "./types/wb-state.js";

export let isWindowClosing = false;

export let scrollLastX = window.scrollX, scrollLastY = window.scrollY;
export let scrollIsChanging = false;

window.addEventListener('DOMContentLoaded', async () => {
    AppStates.isComponentWhiteboard = true

    setWindowComponentID(await window.wandererAPI.getWindowComponentID())
    setWindowComponentIDEl(document.getElementById('window-component-id'))
    windowComponentIDEl.textContent = windowComponentID
    
    const stateObj = await window.wandererAPI.loadWhiteboardState() as WBSave

    if (stateObj && Object.keys(stateObj).length > 0){
        setLargestElID(stateObj.largestElementID)
        setUnusedElIDs(stateObj.unusedElementIDs)
        setLargestPathID(stateObj.largestPathID)
        setUnusedPathIDs(stateObj.unusedPathIDs)
        setLargestNoteContainerID(stateObj.largestNoteContainerID)
        setUnusedNoteContainerIDs(stateObj.unusedNoteContainerIDs)

        setElementPositions(new Map(stateObj.elementPositions))
        setElementHierarchy(new Map(stateObj.elementHierarchy))
        const values = elementHierarchy.values();
        for(const v of values){
            v[0] = new Set(v[0]);
            v[1] = new Set(v[1]);
        }
        setAllPaths(new Map(stateObj.allPaths))
        setAllNotes(new Map(stateObj.allNotes))
        setAllElementConnections(new Map(stateObj.allElementConnections.map(([elID, paths_arr]) => [elID, new Set(paths_arr)])))

        AppStates.isTitlebarLocked = stateObj.isTitlebarLocked
        setZoomFactor(stateObj.zoomFactor)
        setBoardOffset(stateObj.boardOffset)
        setWBOffset(stateObj.wbOffset)

        configureAllElements(wbZoom.children)
        configureAllPaths(allPaths)
        reinstateAllNotesContents()
        reinstateAllBorders(elementPositions)

        document.body.style.cursor = 'default'

        console.log(largestElementID)
        console.log(unusedElementIDs)
        console.log(largestPathID)
        console.log(unusedPathIDs)
        console.log(largestNoteContainerID)
        console.log(unusedNoteContainerIDs)
        console.log(elementPositions)
        console.log(elementHierarchy)
        console.log(allPaths)
        console.log(allNotes)
        console.log(allElementConnections)
        console.log(AppStates.isTitlebarLocked)
        console.log(zoomFactor)
        console.log(boardOffset)
        console.log(wbOffset)
    }

    handleKeybindGuideAppearance(true)
    initTitlebar()
})

window.addEventListener('mousemove', (e) => {
    genMouseMove_WhiteboardMoveHandler(e)
    genMouseMove_ContextMenuHandler(e)
})

window.addEventListener('contextmenu', (e) => {
    if(AppStates.isWritingElement) toggleWritingMode(false, selectedElement!.id);
    if(AppStates.isDrawingPath){
        terminatePathDrawing(e, null);
    }

    openNewContextMenu(e.clientX, e.clientY, gcm)
})

window.addEventListener('mousedown', (e) => {
    closeTabsMenu()
    genMouseDown_WhiteboardMoveHandler(e)
})

window.addEventListener('mouseup', (e) => {
    genMouseUp_WhiteboardMoveHandler(e)
})

window.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key)
}, { capture: true })

window.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key)
}, { capture: true })

window.addEventListener("scroll", () => {
    const dx = window.scrollX - scrollLastX;
    const dy = window.scrollY - scrollLastY;
    scrollLastX = window.scrollX;
    scrollLastY = window.scrollY;
    window.scrollTo(0, 0);
    if(!scrollIsChanging){
        updateComponentPositionsByOffset(dx, dy);
        scrollIsChanging = true;
    } else scrollIsChanging = false;
});

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIn = e.deltaY < 0;
    zoomWhiteboard({ x: e.clientX, y: e.clientY }, zoomIn);
}, { passive: false });

async function save(){
    closeTabsMenu();
    saveAllNotesContents()
    await window.wandererAPI.saveWhiteboardHTML()

    const elementPositionsArr = Array.from(elementPositions, ([elID, pos]) => [elID, pos])
    const elementHierarchyArr = Array.from(elementHierarchy, ([elID, [parents, children]]) => [elID, [Array.from(parents), Array.from(children)]])
    const allPathsArr = Array.from(allPaths, ([id, path]) => [id, path])
    const allNotesArr = Array.from(allNotes, ([elID, note]) => [elID, note])
    const allElementConnectionsArr = Array.from(allElementConnections, ([elID, paths_set]) => [elID, Array.from(paths_set)]);

    await window.wandererAPI.saveWhiteboardState({
        largestElementID,
        unusedElementIDs,
        largestPathID,
        unusedPathIDs,
        largestNoteContainerID,
        unusedNoteContainerIDs,
        elementPositions: elementPositionsArr,
        elementHierarchy: elementHierarchyArr,
        allPaths: allPathsArr,
        allNotes: allNotesArr,
        allElementConnections: allElementConnectionsArr,
        isTitlebarLocked: AppStates.isTitlebarLocked,
        zoomFactor,
        boardOffset,
        wbOffset
    })
}

export function closeWindow(){
    isWindowClosing = true
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onTerminateWindow(() => {
    isWindowClosing = true
})

window.wandererAPI.onSaveComponent(async () => {
    await save();
    window.wandererAPI.saveComponentDone();
})

window.addEventListener("beforeunload", () => {
    if(!isWindowClosing){
        logMessage('berfore unload triggered');
        save();
    }
})

window.wandererAPI.openTitlebarContextMenu((mousePos) => {
    openNewContextMenu(mousePos.x, mousePos.y, tcm)
})

window.wandererAPI.openTabMenu(async (mousePos, windows, previews) => {
    openTabsMenu(mousePos, windows, previews);
});

window.wandererAPI.closeTabMenu(async () => {
    closeTabsMenu();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.wandererAPI.closeTabMenuDone();
        });
    });
});

window.wandererAPI.zoomInWindow((mousePos) => zoomWhiteboard(mousePos, true))
window.wandererAPI.zoomOutWindow((mousePos) => zoomWhiteboard(mousePos, false))