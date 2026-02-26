import { Vector2DLike } from "./vector-2d.js"

export type WandererAPI = {
  logMessage: (message: string) => void,
  openLink: (link: string) => Promise<void>,
  getLink: () => Promise<string>,
  getWindowCenter: () => Promise<any>,
  openConfigs: () => Promise<any>,
  openTabs: () => Promise<any>,
  firstTimeNotepadChosen: () => Promise<any>,
  firstTimeWhiteboardChosen: () => Promise<any>,

  getWindowComponentID: () => Promise<string>,

  saveWhiteboardHTML: () => void,
  saveWhiteboardState: (stateObj: any) => void,
  loadWhiteboardState: () => Promise<unknown>,
  saveNotepadHTML: () => any,
  onTerminateWindow: (callback: () => void) => void,
  onSaveComponent: (callback) => void,
  saveComponentDone: () => void,

  setFullScreen: () => Promise<void>
  setMaximized: () => Promise<void>
  setMinimized: () => Promise<void>
  closeWindow: () => Promise<void>
  openTitlebarContextMenu: (callback: (mousePos: { x: number; y: number }) => void) => void
  openTabMenu: (callback: (mousePos: { x: number; y: number }, windows: unknown[], previews: unknown[]) => void) => void
  closeTabMenu: (callback: () => void) => void
  closeTabMenuDone: () => void
  setMousePosition: (pos: Vector2DLike) => void
  moveWindow: (x: number, y: number, width: number, height: number) => Promise<void>
  zoomInWindow: (callback: (mousePos: { x: number; y: number }) => void) => void
  zoomOutWindow: (callback: (mousePos: { x: number; y: number }) => void) => void

  addNotepad: () => Promise<unknown>
  deleteNotepad: (notepadID: string) => void
  openNotepad: (notepadID: string) => Promise<unknown>
  addWhiteboard: () => Promise<unknown>
  deleteWhiteboard: (whiteboardID: string) => void
  openWhiteboard: (whiteboardID: string) => Promise<unknown>

  saveEditorContents: (contents: string) => Promise<void>
  loadEditorContents: () => Promise<unknown>
}